
const Ecs20140526 = require('@alicloud/ecs20140526').default;
const $Ecs20140526 = require('@alicloud/ecs20140526');
const BssOpenApi20171214 = require('@alicloud/bssopenapi20171214').default;
const $BssOpenApi20171214 = require('@alicloud/bssopenapi20171214');
const OpenApi = require('@alicloud/openapi-client').default;
const $OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util').default;
const $Util = require('@alicloud/tea-util');
const $tea = require('@alicloud/tea-typescript');
const _ = require("lodash");


class Client {
    /**
     * 使用AK&SK初始化账号Client
     * @param accessKeyId
     * @param accessKeySecret
     * @return Client
     * @throws Exception
     */


    static createClient(accessKeyId,accessKeySecret,endpoint) {

        let config = new $OpenApi.Config({
            // 必填，您的 AccessKey ID
            accessKeyId: accessKeyId,
            // 必填，您的 AccessKey Secret
            accessKeySecret: accessKeySecret,
        });
        // Endpoint 请参考 https://api.aliyun.com/product/Ecs
        config.endpoint = endpoint;
        if (endpoint == 'business.aliyuncs.com'){
            return new BssOpenApi20171214(config);
        }
        return new Ecs20140526(config);
    }

    getEcsCount() {
        const accessKeyId = process.env['SC_ACCESSKEY'];
        const accessKeySecret = process.env['SC_ACCESSKEYSECRET'];
        const endpoint = process.env['SC_ENDPOINT'];

        // 创建客户端
        let client = Client.createClient(accessKeyId, accessKeySecret,endpoint);
        let describeInstanceStatusRequest = new $Ecs20140526.DescribeInstanceStatusRequest({
            regionId: process.env['SC_REGION'],
            pageNumber: 1,
            pageSize: 10,
        });
        let instanceStatus = {totalCount: ""};
        let isFirst = true;
        // 调用 API
        var resdata =  client.describeInstanceStatusWithOptions(describeInstanceStatusRequest, new $Util.RuntimeOptions({ }))
            .then((response) => {
                var resdata = {code: 200,data: {totalCount: response?.body?.totalCount}}
                return  resdata;

            })
            .catch((error) => {
                console.log(error.message);
                console.log(error.data);
                Util.assertAsString(error.message);
            });
        return resdata
    }

    getAccountTransactionCount() {
        const accessKeyId = process.env['SC_ACCESSKEY'];
        const accessKeySecret = process.env['SC_ACCESSKEYSECRET'];
        // const endpoint = process.env['SC_ENDPOINT'];
        const endpoint = `business.aliyuncs.com`;
        // 创建客户端
        let client = Client.createClient(accessKeyId, accessKeySecret,endpoint);
        let queryAccountTransactionsRequest = new $BssOpenApi20171214.QueryAccountTransactionsRequest({
            pageNumber: 1,
            pageSize: 10,
        });
        let instanceStatus = {totalCount: ""};
        let isFirst = true;
        // 调用 API
        var resdata =  client.queryAccountTransactionsWithOptions(queryAccountTransactionsRequest, new $Util.RuntimeOptions({ }))
            .then((response) => {
                var resdata = {code: 200,data: {totalCount: response?.body?.data?.totalCount}}
                return  resdata;

            })
            .catch((error) => {
                console.log(error.message);
                console.log(error.data);
                Util.assertAsString(error.message);
            });
        return resdata
    }


    getAcountBalance() {
        const accessKeyId = process.env['SC_ACCESSKEY'];
        const accessKeySecret = process.env['SC_ACCESSKEYSECRET'];
        const endpoint = "business.aliyuncs.com";
        // 创建客户端
        let client = Client.createClient(accessKeyId, accessKeySecret,endpoint);

        // 调用 API
        var resdata =  client.queryAccountBalanceWithOptions( new $Util.RuntimeOptions({ }))
            .then((response) => {
                let accountBalanceBody = JSON.stringify(response?.body)
                accountBalanceBody = JSON.parse(accountBalanceBody)
                return accountBalanceBody;
            })
            .catch((error) => {
                console.log(error.message);
                console.log(error.data);
                Util.assertAsString(error.message);
            });
        return resdata
    }

    getDisksCount() {
        const accessKeyId = process.env['SC_ACCESSKEY'];
        const accessKeySecret = process.env['SC_ACCESSKEYSECRET'];
        const endpoint = process.env['SC_ENDPOINT'];
        // 创建客户端
        let client = Client.createClient(accessKeyId, accessKeySecret,endpoint);

        let describeDisksRequest = new $Ecs20140526.DescribeDisksRequest({
            regionId: process.env['SC_REGION'],
            pageNumber: 1,
            pageSize: 10,
        });

        // 调用 API
        var resdata =  client.describeDisksWithOptions(describeDisksRequest, new $Util.RuntimeOptions({ }))
            .then((response) => {
                var resdata = {code: 200,data: {totalCount: response?.body?.totalCount}}
                return  resdata;

            })
            .catch((error) => {
                console.log(error.message);
                console.log(error.data);
                Util.assertAsString(error.message);
            });
        return resdata
    }

    async listEcsStatusdetail(){
        let ecsCount = await this.getEcsCount();

        ecsCount = ecsCount?.data?.totalCount;
        const accessKeyId = process.env['SC_ACCESSKEY'];
        const accessKeySecret = process.env['SC_ACCESSKEYSECRET'];

        // 创建客户端
        let client = Client.createClient(accessKeyId, accessKeySecret);

        let instanceStatus = {totalCount: ""};
        let isFirst = true;
        let pageSize = 10;
        // 向上取整
        let needReqCount = ecsCount % pageSize === 0 ? ecsCount / pageSize : Math.ceil(ecsCount / pageSize)

        var instanceStatusList = []
        var requests = [];
        for (let i = 1 ; i < needReqCount + 1 ;i++){
            let describeInstanceStatusRequest = new $Ecs20140526.DescribeInstanceStatusRequest({
                regionId: process.env['SC_REGION'],
                pageNumber: i,
                pageSize: 10,
            });
            const requestPromise = client.describeInstanceStatusWithOptions(describeInstanceStatusRequest, new $Util.RuntimeOptions({ }))
                .then((response) => {
                    // console.log(55,response?.body)
                    // var resdata = {code: 200,data: JSON.stringify({totalCount: response?.body?.})}
                    let ecsList = JSON.stringify(response?.body?.instanceStatuses?.instanceStatus)
                    ecsList = JSON.parse(ecsList)
                    instanceStatusList = _.merge(_.keyBy(instanceStatusList, 'instanceId'), _.keyBy(ecsList, 'instanceId'))

                    return instanceStatusList;
                })
                .catch((error) => {
                    console.log(error.message);
                    console.log(error.data);
                    Util.assertAsString(error.message);
                    return null;
                });
            requests.push(requestPromise);
        }

        let responses = await Promise.all(requests);

        var ecsList = [];
        const results = responses.map((response) => {
            if (_.values(response).length == ecsCount ){
                for (let i = 0;i< _.values(response).length;i++){
                    let resInstanceStatus = _.values(response)[i]
                    if ( resInstanceStatus?.status == 'Running') {
                        ecsList.push(resInstanceStatus?.instanceId);
                    }
                }
            }
        })
        var resdata = {code: 200,data: JSON.stringify(ecsList)}
        return resdata;
    }

    async listAccountTransactions(){
        let accountTransactionsCount = await this.getAccountTransactionCount();
        accountTransactionsCount = accountTransactionsCount?.data?.totalCount;
        const accessKeyId = process.env['SC_ACCESSKEY'];
        const accessKeySecret = process.env['SC_ACCESSKEYSECRET'];
        // const endpoint = process.env['SC_ENDPOINT'];
        const endpoint = `business.aliyuncs.com`;

        // 创建客户端

        let pageSize = 10;
        let needReqCount = accountTransactionsCount % pageSize === 0 ? accountTransactionsCount / pageSize : Math.ceil(accountTransactionsCount / pageSize)
        let client = Client.createClient(accessKeyId, accessKeySecret,endpoint);

        var accountTransactionsList = []
        var requests = [];
        for (let i = 1 ; i < needReqCount + 1 ;i++){
            let queryAccountTransactionsRequest = new $BssOpenApi20171214.QueryAccountTransactionsRequest({
                pageNumber: i,
                pageSize: 10,
            })
            let runtime = new $Util.RuntimeOptions({
                readTimeout: 10000,
                connectTimeout: 10000,
            });
            const requestPromise = client.queryAccountTransactionsWithOptions(queryAccountTransactionsRequest, runtime)
                .then((response) => {
                    let transactionsList = JSON.stringify(response?.body?.data?.accountTransactionsList?.accountTransactionsList)
                    transactionsList = JSON.parse(transactionsList)
                    // return transactionsList;


                    return transactionsList;
                })
                .catch((error) => {
                    console.log(error.message);
                    console.log(error.data);
                    Util.assertAsString(error.message);
                    return null;
                });
            requests.push(requestPromise);
        }
        let responses = await Promise.all(requests);

        var resdata = {code: 200,data: []}
        const results = responses.map((response,index) => {
            for (let i = 0;i<response.length;i++){
                resdata.data.push(response[i])
            }
            if (index+1 == needReqCount){
                return resdata
            }

        })
        return resdata;
    }

    async listDescribeEcsInstance(){
        let ecsCount = await this.getEcsCount();
        ecsCount = ecsCount?.data?.totalCount;
        const accessKeyId = process.env['SC_ACCESSKEY'];
        const accessKeySecret = process.env['SC_ACCESSKEYSECRET'];
        const endpoint = process.env['SC_ENDPOINT'];
        // 创建客户端

        let pageSize = 10;
        let needReqCount = ecsCount % pageSize === 0 ? ecsCount / pageSize : Math.ceil(ecsCount / pageSize)
        let client = Client.createClient(accessKeyId, accessKeySecret,endpoint);

        var requests = [];
        var instanceDescribeList = []
        for (let i = 1 ; i < needReqCount + 1 ;i++){
            let describeInstancesRequest = new $Ecs20140526.DescribeInstancesRequest({
                regionId: process.env['SC_REGION'],
                pageNumber: i,
                pageSize: 10,
            });
            const requestPromise = client.describeInstancesWithOptions(describeInstancesRequest, new $Util.RuntimeOptions({ }))
                .then((response) => {
                    let ecsList = JSON.stringify(response?.body?.instances?.instance)
                    ecsList = JSON.parse(ecsList)
                    instanceDescribeList = _.merge(_.keyBy(instanceDescribeList, 'instanceId'), _.keyBy(ecsList, 'instanceId'))

                    return instanceDescribeList;
                })
                .catch((error) => {
                    console.log(error.message);
                    console.log(error.data);
                    Util.assertAsString(error.message);
                    return null;
                });
            requests.push(requestPromise);
        }
        let responses = await Promise.all(requests);

        var ecsList = [];
        var resdata = {code: 200,data: ""}
        const results = responses.map((response) => {

            if (_.values(response).length == ecsCount ){
                resdata.data = _.values(response)
                return resdata;
            }
        })
        return resdata;
    }

    async listDescribeDisksInstance(){
        let diskCount = await this.getDisksCount();
        diskCount = diskCount?.data?.totalCount;

        const accessKeyId = process.env['SC_ACCESSKEY'];
        const accessKeySecret = process.env['SC_ACCESSKEYSECRET'];
        const endpoint = process.env['SC_ENDPOINT'];

        let pageSize = 10;
        let needReqCount = diskCount % pageSize === 0 ? diskCount / pageSize : Math.ceil(diskCount / pageSize)
        let client = Client.createClient(accessKeyId, accessKeySecret,endpoint);

        var requests = [];
        var diskDescribeList = []
        for (let i = 1 ; i < needReqCount + 1 ;i++){
            let describeDisksRequest = new $Ecs20140526.DescribeDisksRequest({
                regionId: process.env['SC_REGION'],
                pageNumber: i,
                pageSize: 10,
            });
            const requestPromise = client.describeDisksWithOptions(describeDisksRequest, new $Util.RuntimeOptions({ }))
                .then((response) => {
                    let diskList = JSON.stringify(response?.body?.disks?.disk)
                    diskList = JSON.parse(diskList)
                    diskDescribeList = _.merge(_.keyBy(diskDescribeList, 'diskId'), _.keyBy(diskList, 'diskId'))

                    return diskDescribeList;
                })
                .catch((error) => {
                    console.log(error.message);
                    console.log(error.data);
                    Util.assertAsString(error.message);
                    return null;
                });
            requests.push(requestPromise);
        }
        let responses = await Promise.all(requests);

        var resdata = {code: 200,data: ""}
        const results = responses.map((response) => {
            if (_.values(response).length == diskCount ){
                resdata.data = _.values(response)
                return resdata;
            }
        })
        return resdata;
    }


     async genMetrics(type){

        if (type == 'listDescribeEcsInstance'){
            let ecsInstanceDescribeInstances = await this.listDescribeEcsInstance();
            ecsInstanceDescribeInstances = ecsInstanceDescribeInstances?.data;
            var describeEcsInstance = {}
            ecsInstanceDescribeInstances.forEach(function(ecsInstanceDescribeInstance){
                describeEcsInstance['cpu'] = ecsInstanceDescribeInstance?.cpu;
                describeEcsInstance['creationtime'] = ecsInstanceDescribeInstance?.creationTime;
                describeEcsInstance['expiredtime'] = ecsInstanceDescribeInstance?.expiredTime;
                describeEcsInstance['hostname'] = ecsInstanceDescribeInstance?.hostName;
                describeEcsInstance['instanceid'] = ecsInstanceDescribeInstance?.instanceId;
                describeEcsInstance['instancename'] = ecsInstanceDescribeInstance?.instanceName;
                describeEcsInstance['memory'] = ecsInstanceDescribeInstance?.memory;
                describeEcsInstance['starttime'] = ecsInstanceDescribeInstance?.startTime;
                describeEcsInstance['regionid'] = ecsInstanceDescribeInstance?.regionId;
                describeEcsInstance['ipaddress'] = ecsInstanceDescribeInstance?.vpcAttributes?.privateIpAddress?.ipAddress[0];
                describeEcsInstance['status'] = ecsInstanceDescribeInstance?.status;
                describeEcsInstance['instancechargetype'] = ecsInstanceDescribeInstance?.instanceChargeType;

                let value = Math.round((Date.now() - new Date(ecsInstanceDescribeInstance?.startTime).getTime()) / 1000 )
                let metricString = `aliyun_ecs_describe_health{`;
                Object.entries(describeEcsInstance).forEach(([key, value]) => {
                    metricString += `"${key}"="${value}",`;
                });
                metricString = metricString.slice(0, -1); // remove the last comma
                metricString += '}'  + ' ' + value;
                console.log(metricString);

            });

        }else if (type == 'listDescribeDisksInstance'){
            let diskInstanceDescribeInstances = await this.listDescribeDisksInstance();
            diskInstanceDescribeInstances = diskInstanceDescribeInstances?.data;
            var describeDiskInstance = {}
            diskInstanceDescribeInstances.forEach(function(diskInstanceDescribeInstance) {
                describeDiskInstance['detachedtime'] = diskInstanceDescribeInstance?.detachedTime;
                describeDiskInstance['size'] = diskInstanceDescribeInstance?.size;
                describeDiskInstance['diskchargetype'] = diskInstanceDescribeInstance?.diskChargeType;
                describeDiskInstance['expiredtime'] = diskInstanceDescribeInstance?.expiredTime;
                describeDiskInstance['status'] = diskInstanceDescribeInstance?.status;
                describeDiskInstance['zoneid'] = diskInstanceDescribeInstance?.zoneId;
                describeDiskInstance['diskname'] = diskInstanceDescribeInstance?.diskName;
                describeDiskInstance['creationtime'] = diskInstanceDescribeInstance?.creationTime;
                describeDiskInstance['diskid'] = diskInstanceDescribeInstance?.diskId;
                describeDiskInstance['regionid'] = diskInstanceDescribeInstance?.regionId;
                describeDiskInstance['attachedtime'] = diskInstanceDescribeInstance?.attachedTime;
                describeDiskInstance['enableautomatedsnapshotpolicy'] = diskInstanceDescribeInstance?.enableAutomatedSnapshotPolicy;
                describeDiskInstance['autosnapshotpolicyid'] = diskInstanceDescribeInstance?.autoSnapshotPolicyId == "" ? "none" : diskInstanceDescribeInstance?.autoSnapshotPolicyId;

                let value = Math.round((Date.now() - new Date(diskInstanceDescribeInstance?.creationTime).getTime()) / 1000 )
                let metricString = `aliyun_disk_describe_health{`;
                Object.entries(describeDiskInstance).forEach(([key, value]) => {
                    metricString += `"${key}"="${value}",`;
                });
                metricString = metricString.slice(0, -1); // remove the last comma
                metricString += '}'  + ' ' + value;
                console.log(metricString);
            })
        }else if (type == 'getAcountBalance'){
            let acountBalanceData = await this.getAcountBalance();
            acountBalanceData = acountBalanceData?.data;
            var acountBalanceDetail = {}
            // acountBalanceDetail['availableamount'] = acountBalanceData?.availableAmount;
            // acountBalanceDetail['availableCashAmount'] = acountBalanceData?.availableCashAmount;
            acountBalanceDetail['creditAmount'] = acountBalanceData?.creditAmount;
            acountBalanceDetail['currency'] = acountBalanceData?.currency;
            acountBalanceDetail['mybankCreditAmount'] = acountBalanceData?.mybankCreditAmount;

            let metricString = `aliyun_account_balance_health{`;
            Object.entries(acountBalanceDetail).forEach(([key, value]) => {
                metricString += `"${key}"="${value}",`;
            });
            metricString = metricString.slice(0, -1); // remove the last comma
            let value = parseFloat(acountBalanceData?.availableAmount.replace(',', ''));
            metricString += '}'  + ' ' + value;


            console.log(metricString);

        }else if (type == 'listAccountTransactions'){
            let accountTransactionsDataList = await this.listAccountTransactions();
            accountTransactionsDataList = accountTransactionsDataList?.data;

            var acountTransationDetail = {}
            accountTransactionsDataList.forEach(function(accountTransactionsData) {
                acountTransationDetail['amount'] = accountTransactionsData?.amount;
                acountTransationDetail['balance'] = accountTransactionsData?.balance;
                acountTransationDetail['billingcycle'] = accountTransactionsData?.billingCycle;
                acountTransationDetail['fundtype'] = accountTransactionsData?.fundType;
                acountTransationDetail['recordid'] = accountTransactionsData?.recordID;
                acountTransationDetail['transactionchannel'] = accountTransactionsData?.transactionChannel;
                acountTransationDetail['transactionflow'] = accountTransactionsData?.transactionFlow;
                acountTransationDetail['transactionnumber'] = accountTransactionsData?.transactionNumber;
                acountTransationDetail['transactiontime'] = accountTransactionsData?.transactionTime;
                acountTransationDetail['transactiontype'] = accountTransactionsData?.transactionType;
                acountTransationDetail['remarks'] = accountTransactionsData?.remarks;

                let metricString = `aliyun_account_transaction_health{`;
                Object.entries(acountTransationDetail).forEach(([key, value]) => {
                    metricString += `"${key}"="${value}",`;
                });
                metricString = metricString.slice(0, -1); // remove the last comma
                let value = Math.round( new Date(accountTransactionsData?.transactionTime).getTime() / 1000 )
                metricString += '}'  + ' ' + value;

                console.log(metricString);
            })



        }
     }

}




module.exports = Client;