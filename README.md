# middleware-shell-exporter （[ENGLISH](README-en.md)）
Middleware Shell Exporter可以执行所有类型的脚本并推送到Prometheus(Victoriametrics)。

这是专门给DBA和运维人员提供的方案(DB类中间件执行一次读写才能判断这个中间件是否健康),并且支持自定义检查模块。

![GitHub](https://img.shields.io/badge/license-GPL-blue.svg)

# 部署
* [部署文档](/docs/deploy/main.md) 

## 现有支持检查的中间件

* mongo_replicaset mongo副本部署模式
* mongo_shard mongo副本分片模式
* mongo_standalone mongo单机模式
* redis_master_slave redis主从模式
* redis_standalone redis单机模式
* mysql_standalone mysql单机模式
* curl_check  curl检查api接口健康
* aliyun_ecs  阿里云的磁盘和ecs详情转换成指标
* kafka_cluster  支持2.x-3.x版本
## 特征

* 自定义版本的客户端,只要把对应的官方客户端放到bin目录下,就能适配不同的集群
* 支持自定义shell生成指标
* 支持定制化检查模块
* 支持监控,如执行的次数,成功与否等
* 不用sdk去操作数据库,使用官方原生的客户端
* 支持自定义输出转指标

## 指标说明
* [指标示例](docs/other/METRICS.md) 
