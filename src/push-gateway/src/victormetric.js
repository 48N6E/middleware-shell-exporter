const request = require('request');
const fs = require('fs');
const async = require('async');
const { config } = require('process');
const { WSASERVICE_NOT_FOUND } = require('constants');
const _ = require('lodash')


class VictorMetric {
    constructor(url, reqTimeout) {
        this.url = url;
        this.reqTimeout = reqTimeout;
    }

    PostJob(additioLabels, metricsStr, callback) {
        let _this = this;
        let vUrl = new URL(_this.url + '/api/v1/import/prometheus')
        
        if (additioLabels) {
            for (let i in additioLabels) {
                vUrl.searchParams.append('extra_label', i + '=' + additioLabels[i])
            }
        }

        request.post(vUrl.toString(), {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: _this.reqTimeout * 1000,
            body: metricsStr
        }, function (err, response, body) {
            if (err || !response || response.statusCode != 204) {
                console.log('push gateway post fail: ', vUrl.toString(), err, response);
                return callback('fail');
            }
            console.log('push gateway post success: ', vUrl.toString());
            return callback(null)
        })
    }

    DeleteJob(additioLabels, callback) {
        return callback(null)
    }
}

module.exports = VictorMetric
