const AppError = require('../controllers/errorController').AppError;
const runCMD = require('../utils/utils').runCMD;
const fs = require('fs');
const path = require('path');
const AppMetrics = require('../utils/utils').AppMetrics;
const checkParam = require('../utils/utils').checkParam;
const matchMetrics = require('../utils/utils').matchMetrics;
const _ = require('lodash')
const url = require('url')
const prom_client = require("prom-client");
const crypto = require('crypto');
const moment = require("moment");


exports.execMetric = async (req, res, next) => {
    //check module path
    let [isok,checkModuleName,param_schemaPath,scriptPath] = check_module_path(req)
    if (!isok) {
        return res.status(404).send('检查模块不存在')
    }

    // check url params
    let checkResult = check_url_params(req,param_schemaPath)
    if (checkResult) {
        res.send(checkResult)
        return next(new AppError(checkResult, 402));
    }

    // exec shell and check shell if already running
    let ifRunning = check_shell_already_running(req,scriptPath)
    let shellResult = '';
    if (!ifRunning) {
        let  milscondes = Number(process.env.SHELL_TIMEOUT) || 30000;
        setTimeout(shell_timeout,milscondes,req,res,scriptPath,checkModuleName,2)
        shellResult = await exec_shell(req,scriptPath)
        // shell timeout
    }else {
        shellResult = {code:0,stdout:"exit_health{\"msg\"=\"shell already running\"} 1"}
        let execHashCode = gen_shell_hash(req,scriptPath)
        let metric = gen_metrics(shellResult,checkModuleName)
        shellExecDetail[execHashCode].send = 1
        metric.metrics()
            .then(function(result) {
                res.send(result)
            }, function(err) {
                res.statusCode(500).send(err);
            })
        console.log( moment().format("YYYY-MM-DD HH:mm:ss ") +'INFO 当前shell已经运行' + JSON.stringify(shellExecDetail[execHashCode]))
    }

    // count shell result
    count_shell_result(checkModuleName,shellResult,req)

    // gen metrics
    let execHashCode = gen_shell_hash(req,scriptPath)
    if (shellExecDetail[execHashCode].send != 1 ) {
        let metric = gen_metrics(shellResult,checkModuleName)
        metric.metrics()
            .then(function(result) {
                res.send(result)
            }, function(err) {
                res.statusCode(500).send(err);
            })
    }
}


function check_module_path(req){
    let checkModuleName = (url.parse(req.url).pathname).split('/')[1];
    let param_schemaPath = path.join(__dirname,'../','check_module'+'/'+checkModuleName+'/param_schema.json');
    let scriptPath = path.join(__dirname,'../','check_module'+'/'+checkModuleName+'/check.sh');
    let moduleExists = isFileExist(param_schemaPath);
    if (moduleExists) {
        return [false,checkModuleName,param_schemaPath,scriptPath]
    }
    return [true,checkModuleName,param_schemaPath,scriptPath]
}

function check_url_params(req,param_schemaPath){
    let param_schema = require(param_schemaPath)
    let queryParams = req.query
    let checkResult = checkParam(param_schema,queryParams)
    return checkResult
}

async function exec_shell(req,scriptPath) {
    let shellEnv = req.query;
    shellEnv.PATH = path.join(__dirname,'../','bin') + ':' + process.env.PATH;
    let cmdPath = '/bin/bash  ' + scriptPath;/**/
    let shellResult = await runCMD(cmdPath,shellEnv,path.dirname(scriptPath))
    return shellResult
}

function gen_shell_hash(req,scriptPath){
    let hash = crypto.createHash('md5');
    let shellEnv = req.query;
    let cmdPath = '/bin/bash  ' + scriptPath;/**/
    shellEnv.PATH = path.join(__dirname,'../','bin') + ':' + process.env.PATH;
    options = {env: shellEnv,cwd:path.dirname(scriptPath)};
    let execHashCode = hash.update(cmdPath + JSON.stringify(options)).digest('hex');
    return execHashCode;
}

function shell_timeout(req,res,scriptPath,checkModuleName){
    let execHashCode = gen_shell_hash(req,scriptPath)
    let shellResult = {code:0,stdout:"exit_health{\"msg\"=\"shell timeout\"} 1"}
    let metric = gen_metrics(shellResult,checkModuleName)
    if (shellExecDetail.hasOwnProperty(execHashCode) &&  shellExecDetail[execHashCode].timeout == 0 && shellExecDetail[execHashCode].send != 1){
        shellExecDetail[execHashCode].timeout = 1
        shellExecDetail[execHashCode].delete = 1
        shellExecDetail[execHashCode].send = 1
        metric.metrics()
            .then(function(result) {
                res.send(result)
            }, function(err) {
                res.send(err);
            })
        console.log( moment().format("YYYY-MM-DD HH:mm:ss ") +'INFO 当前shell运行超时' + JSON.stringify(shellExecDetail[execHashCode]))
    }

}

function check_shell_already_running(req,scriptPath){
    let execHashCode = gen_shell_hash(req,scriptPath)
    if (shellExecDetail.hasOwnProperty(execHashCode)){
        if (shellExecDetail[execHashCode].running == 1 ){
            return true
        }
    }
    return false
}

function gen_metrics(shellResult,checkModuleName) {
    let metricList =  matchMetrics(shellResult.stdout);
    let exitMetricExists = shellResult.stdout.includes("exit_health");
    let exitCode = shellResult.code;
    let metricRegistry = new prom_client.Registry();
    let metricNameDict = {}
    if (metricList) {
        // let metricNameList = _.keys(metricsDict)
        metricList.forEach(function(item,index){
            try {
                if ( metricNameDict.hasOwnProperty(item.metricName)) {
                    metricNameDict[item.metricName].setValue(item.label, item.value)
                }else {
                    let metric = new AppMetrics({
                        name: 'health_' + checkModuleName + '_' + item.metricName,
                        help: 'health_' + checkModuleName + '_' + item.metricName,
                        labelNames: _.keys(item.label),
                        registry: metricRegistry
                    })
                    metric.setValue(item.label, item.value)
                    metricNameDict[item.metricName] = metric;
                }
            }catch (e) {
                console.log( moment().format("YYYY-MM-DD HH:mm:ss ") +'Error 当前AppMetrics错误！ label name = ' + JSON.stringify(item.label) + e)
            }
        })
    }
    //base metricname
    if (!exitMetricExists){
        const metric = new AppMetrics({
            name: 'health_' + checkModuleName + '_exit',
            help: 'health_' + checkModuleName + '_exit',
            labelNames: [],
            registry: metricRegistry
        })
        metric.setValue(exitCode)
        return metric
    }
    return metricRegistry
}

function count_shell_result(checkModuleName,shellResult,req) {
    process.env.shellCount ++
    if (shellResult.code == 0) {
        process.env.successCount ++
    }else{
        process.env.failCount ++
    }
    if (!shellResult.stdout.match(/failcount_health/g)) {
        if (!shellResult.stdout.match(/alert_health{"msg"="ok"}/g)){
            process.env.failCount ++
        }
    }
    let hash = crypto.createHash('md5')
    let execHashCode = hash.update('health_' + checkModuleName + '_exit' + req.query).digest('hex')
    shellExecResult[execHashCode] = { metricname: 'health_' + checkModuleName + '_exit' , label : req.query ,value:shellResult.code,lastts: Date.parse(new Date()) }
}

function isFileExist(path) {
    try{
        fs.accessSync(path,fs.F_OK);
    }catch(e){
        return true;
    }
    return
}