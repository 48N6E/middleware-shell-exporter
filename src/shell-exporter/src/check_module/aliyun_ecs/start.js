const Client = require('./aliyunECS')
// console.log(process.env);


const aliyunClient = new Client({
    accessKeyId: process.env['SC_ACCESSKEY'],
    accessKeySecret: process.env['SC_ACCESSKEYSECRET'],
    endpoint: process.env['SC_ENDPOINT']
})

async function startAliyunMetrics(){
    let needReqList = process.env['SC_NEEDREQ'].split(',');
    for (let i = 0;i < needReqList.length;i++){
        if (needReqList[i] == 'a' ) {
            let a  = await aliyunClient.genMetrics('listDescribeEcsInstance')
        }else if (needReqList[i] == 'b' ) {
            let b = await aliyunClient.genMetrics('listDescribeDisksInstance')
        }else if (needReqList[i] == 'c' ) {
            let c = await aliyunClient.genMetrics('getAcountBalance')
        }else if (needReqList[i] == 'd' ) {
            let d = await aliyunClient.genMetrics('listAccountTransactions')
        }
    }
}

startAliyunMetrics()