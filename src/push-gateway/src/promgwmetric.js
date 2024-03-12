const request = require('request');
const fs = require('fs');
const async = require('async');
const { config } = require('process');
const { WSASERVICE_NOT_FOUND } = require('constants');
const _ = require('lodash')

class PrometheusGWMetric {
    constructor(url, jobName, reqTimeout) {
        this.url = url;
        this.jobName = jobName;
        this.reqTimeout = reqTimeout;
    }

    PostJob(additioLabels, metricsStr, callback) {
        let _this = this;
        let prometheus_push_url = _this.url + '/metrics/job/' + _this.jobName;
        if (additioLabels) {
            for (let i in additioLabels) {
                prometheus_push_url += '/' + i + '/' + additioLabels[i];
            }
        }

        request.post(prometheus_push_url, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: _this.reqTimeout * 1000,
            body: metricsStr
        }, function (err, response, body) {
            if (err || !response || response.statusCode != 200) {
                console.log('push gateway post fail: ', prometheus_push_url, err, response);
                return callback('fail');
            }
            console.log('push gateway post success: ', prometheus_push_url);
            return callback(null)
        })
    }

    DeleteJob(additioLabels, callback) {
        let _this = this;
        let prometheus_delete_url = _this.url + '/metrics/job/' + _this.jobName;
        if (additioLabels) {
            for (let i in additioLabels) {
                prometheus_delete_url += '/' + i + '/' + additioLabels[i];
            }
        }

        request.delete(prometheus_delete_url, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: _this.reqTimeout * 1000
        }, function (err, response, body) {
            if (err || !response || response.statusCode != 202) {
                console.log('push gateway delete fail: ', prometheus_delete_url, err, response);
                return callback('fail')
            }
            console.log('push gateway delete success: ', prometheus_delete_url);
            return callback(null)
        })
    }
}

module.exports = PrometheusGWMetric