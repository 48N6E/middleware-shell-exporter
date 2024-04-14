const _ = require("lodash");
const util = require('util')
const child_process = require('child_process');
const exec = util.promisify(child_process.exec)
const moment = require("moment");
const AppError = require('../controllers/errorController').AppError;
const prom_client = require('prom-client');
const crypto = require('crypto');
const async = require('async');

/*match metrics from shell output 
*
*/
exports.matchMetrics = function (str) {
    let matchList = str.match(/[a-z_].*_health(\{[a-zA-Z=",!:<>)\-.0-9_( ]+\}|) [0-9].*/g)
    let metricDict = {}
    if (!matchList) {
        return null
    }
    let metricList = new Array();
    matchList.forEach(function(item,index) {
        let metricName = item.split('_health ')[0].trim();
        //find label
        if ( metricName.indexOf('{') != -1 ) {
            try {
                let metricLabel = metricName;
                metricName = metricName.substring(0,metricName.indexOf('{')).split('_health')[0];
                metricLabel = metricLabel.replace(/=/g, ':');
                metricLabel = metricLabel.replace(/-/g, '_');
                metricLabel = metricLabel.substring(metricLabel.indexOf('{'),metricLabel.indexOf('}')+1)
                metricLabel = JSON.parse(metricLabel)
                let metricValue = item.split('} ')[1]*1;
                metricDict[metricName] = {'label':metricLabel,'value':metricValue}
                metricList[matchList.indexOf(item)] = { 'metricName':metricName,'label':metricLabel,'value':metricValue}
            }catch(e){
                let metricValue = item.split('} ')[1]*1;
                let metricLabel = metricName;
                metricDict[metricName] = {'label':[],'value':metricValue};
                metricList[matchList.indexOf(item)] = { 'metricName':metricName,'label':[],'value':metricValue}
                console.log( moment().format("YYYY-MM-DD HH:mm:ss ") +'Error 当前matchMetrics错误！' + metricLabel + e)
            }
        }else {
            let metricValue = item.split(' ')[1]*1;
            metricDict[metricName] = {'label':[],'value':metricValue};
            metricList[matchList.indexOf(item)] = { 'metricName':metricName,'label':[],'value':metricValue}
        }
    })
    return metricList;
}


const _runCMD = async function (cmd,shellEnv,cwd) {
    try{
        let hash = crypto.createHash('md5')
        options = {env: shellEnv,cwd:cwd}
        let execHashCode = hash.update(cmd + JSON.stringify(options)).digest('hex')
        shellExecDetail[execHashCode] = {time:moment(),timeout:0,delete:0,running:1,send:0}
        const {stdout,stderr} = await exec(cmd,options)
        console.log( moment().format("YYYY-MM-DD HH:mm:ss ") + cmd + " stdout: " + stdout + " stderr: " + stderr)
        shellExecDetail[execHashCode].delete = 1
        shellExecDetail[execHashCode].running = 0
        shellExecDetail[execHashCode].timeout = 2
        return {'code':0,stdout:stdout}
    }catch(e){
        console.log( moment().format("YYYY-MM-DD HH:mm:ss ") + cmd + " error: " + e)
        if (e.killed){
            return {'code':(e.code == null ) ? 1: e.code,stdout:'alert_health{"msg"="shell timeout"} 0\n'}
        }
        return {'code':(e.code == null ) ? 1: e.code,stdout:e}
    }

}

exports.runCMD = async function  (cmd,shellEnv,cwd)  {
    const b = await _runCMD(cmd,shellEnv,cwd)
    return b;
}

exports.checkParam = function (module,queryParams)  {
    queryList = _.keys(queryParams)
    moduleList = _.keys(module)
    if (queryList.length == moduleList.length) {
        try {
            queryList.forEach(function (item,index) {
                let reg = module[item].regex;
                let res = queryParams[item].match(reg);
                if (!res) {
                    console.log( moment().format("YYYY-MM-DD HH:mm:ss ") +'Error 当前参数校验错误！' + item)
                    throw new AppError('当前参数校验错误！' + item, 402)
                }
            })
        }catch(e) {
            return e.message;
        }
    }else{
        return "Error 当前参数校验错误,参数不够"
    }
}


exports.AppMetrics  = class  {
    constructor(options) {
        options = options || {};
        if (!options.name && !(options.help && options.labelNames)) {
            throw new Error('Lack for arguments!');
        }
        this.name = options.name;
        this.help = options.help;
        this.labelNames = options.labelNames;
        this.registry = options.registry;
        this.promClient = new prom_client.Gauge({
            name: this.name,
            help: this.help,
            labelNames: this.labelNames,
            registers: [this.registry]
        });
    }
    setValue(labelDictt,value,client) {
        if (client) {
            return client.set(labelDictt,value)
        }
        this.promClient.set(labelDictt,value)
    }
    async metrics(){
        const metricsvalue = await this.registry.metrics()
        return metricsvalue
    }
}