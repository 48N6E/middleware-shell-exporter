const _ = require('lodash')
const prom_client = require("prom-client");
const moment = require("moment");
const AppMetrics = require('../utils/utils').AppMetrics;

exports.exportMetric =  (req, res, next) => {
    let metrics = gen_metrics()
    metrics.metrics()
        .then(function(result) {
            res.send(result)
        }, function(err) {
            res.statusCode(500).send(err);
        })

}

function gen_metrics() {
    //shell execute detail
    let shellResultList = _.keys(shellExecResult)
    let metricRegistry = new prom_client.Registry();
    try{
        let metric = new AppMetrics({
            name: 'health_shell_result',
            help: 'health_shell_result',
            labelNames:  ['metricname','label'],
            registry: metricRegistry
        })
        shellResultList.forEach(function (item, index) {
            let labelDict = {}
            labelDict['metricname'] = shellExecResult[item].metricname;
            shellExecResult[item].label['exitcode'] = shellExecResult[item].value;
            delete shellExecResult[item].label['PATH']
            delete shellExecResult[item].label['passwd']
            labelDict['label']  = JSON.stringify(shellExecResult[item].label)
            metric.setValue(labelDict, shellExecResult[item].lastts)
        })

    }catch (e){
        console.log( moment().format("YYYY-MM-DD HH:mm:ss ") +'Error 当前ShellMetrics错误！ '  + e)
    }
    //shell execute count
    let metricName = {'health_shell_count':Number(process.env.shellCount),'health_shell_successcount':Number(process.env.successCount),'health_shell_failcount':Number(process.env.failCount)}
    let metricNameList = _.keys(metricName)
    let metric = 0
    metricNameList.forEach(function(item){
        metric = new AppMetrics({
            name: item,
            help: item,
            labelNames: [],
            registry: metricRegistry
        })
        metric.setValue(metricName[item])

    })
    return metric
}

