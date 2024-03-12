
const request = require('request');
const fs = require('fs');
const async = require('async');
const process = require('process');
const _ = require('lodash')


function StringAppend(url, strsArray) {
    if (_.isArray(strsArray)) {
        return url + strsArray.join("")
    } else {
        return url
    }
}

class Config {
    constructor(path) {
        this.path = path
    }

    load() {
        let _this = this

        try {
            fs.accessSync(_this.path, fs.F_OK)
        } catch (error) {
            return new Error('configure path is not exist')
        }

        try {
            _this.config_obj = JSON.parse(fs.readFileSync(_this.path))
        } catch (err) {
            console.log('configure file is not json: ', _this.path);
            return new Error('configure file is not json')
        }
    
        if (_this.config_obj.scape_inteval_sec < _this.config_obj.scape_timeout_sec ||
            _this.config_obj.targets.length == 0) {
            console.log('configure file param error: ', _this.config_obj);
            return new Error('configure file param error');
        }

            //如果source_url是数组，那么把它展开到第一级
        _this.config_obj.expandTargets = []
        _this.config_obj.targets.forEach(element => {
            if (_.isArray(element.source_url)) {
                element.source_url.forEach(function(url) {
                    _this.config_obj.expandTargets.push({
                        source_url: StringAppend(url, element.source_url_str_appends),
                        addition_labels: element.addition_labels
                    })
                })
            } else if (_.isString(element.source_url)) {
                _this.config_obj.expandTargets.push({
                    source_url: StringAppend(element.source_url, element.source_url_str_appends),
                    addition_labels: element.addition_labels
                })
            } else {
                console.log("source url is not string/array: ", element.source_url)
                return new Error('source url is not string/array');
            }
        });

        return null
    }

    Get() {
        return this.config_obj
    }

    static Create(path) {
        let c = new Config(path)

        if (c.load() != null) {
            return null
        }

        return c
    }
}


module.exports = Config