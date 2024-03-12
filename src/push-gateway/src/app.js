const request = require('request');
const fs = require('fs');
const async = require('async');
const process = require('process');
const _ = require('lodash')
const { program } = require('commander');
const Config = require('./config')
const PrometheusGWMetric = require('./promgwmetric')
const VictorMetric = require('./victormetric')
const PromParser = require('./prom_parse')

function CmdPush(config_obj, options, callback) {
    let pm = null;

    if (config_obj.push_gateway_url &&
        config_obj.push_gateway_job_name &&
        config_obj.push_gateway_post_timeout_sec) {
        pm = new PrometheusGWMetric(
            config_obj.push_gateway_url,
            config_obj.push_gateway_job_name,
            config_obj.push_gateway_post_timeout_sec);
    } else if (config_obj.victoria_url &&
                config_obj.victoria_post_timeout_sec) {
        pm = new VictorMetric(
            config_obj.victoria_url,
            config_obj.victoria_post_timeout_sec);
    } else {
        console.log('configure file param2 error: ', config_obj);
        process.exit(-1);
    }

    setInterval(() => {
        async.eachOf(config_obj.expandTargets, function (target, idx, callback2) {
            request.get(target.source_url, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: config_obj.scape_timeout_sec * 1000
            }, function (err, response, sourceRspbody) {
                if (err || !response || response.statusCode != 200) {
                    console.log('request target export fail: ', target.source_url, err, response);
                    return pm.DeleteJob(target.addition_labels, function () { callback2(null) });
                }

                async.waterfall([
                    function (callback1) {
                        return pm.DeleteJob(target.addition_labels, function () { callback1(null) });
                    },
                    function (callback1) {
                        return pm.PostJob(target.addition_labels, sourceRspbody, function () { callback1(null) });
                    }
                ], callback2)
            });
        }, function () { })
    }, config_obj.scape_inteval_sec * 1000)
}

function CmdCheckOnce(config_obj, options) {
    async.retry({times: 1000, interval: 3000}, function(callback) {

        async.eachOf(config_obj.expandTargets, function (target, idx, callback2) {
            console.log("checking: ", target.source_url, options.check_metricname, options.expect_metricvalue)

            request.get(target.source_url, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: config_obj.scape_timeout_sec * 1000
            }, function (err, response, sourceRspbody) {
                if (err || !response || response.statusCode != 200) {
                    console.log('request target export fail: ', err, response);
                    return callback2("check metricname/value fail")
                }
                
                let p = PromParser.Create(sourceRspbody)
                if (!p) {
                    console.log('request target source parse prometheus fail');
                    return callback2("check metricname/value fail")
                }
    
                if (p.Check(options.check_metricname, options.expect_metricvalue)) {
                    console.log("check metricname/value success")
                    return callback2(null)
                } else {
                    console.log("check metricname/value fail")
                    return callback2("check metricname/value fail")
                }
            });
        }, callback)

    }, function(err) {
        console.log("-----------")
        if (err) {
            console.log("Fail")
        } else {
            console.log("Success")
        }
        console.log("-----------")
    })

}




program.requiredOption('--config <value>', 'config file')

        
program
    .command('push')
    .description('interval push target to push gw')
    .action(function(options) {
        let config = Config.Create(program.opts().config)
        if (!config) {
            console.log('configure parsed fail')
            process.exit(1)
        }

        CmdPush(config.Get(), options)
    })

program
    .command('checkonce')
    .requiredOption('--check_metricname <value>', "check metricname")
    .requiredOption('--expect_metricvalue <value>', "expect metric value")
    .action(function(options) {
        let config = Config.Create(program.opts().config)
        if (!config) {
            console.log('configure parsed fail')
            process.exit(1)
        }

        CmdCheckOnce(config.Get(), options)
    })
    
program.parse()
