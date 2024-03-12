| 模块名                | 指标                                                                                                                                         | 示例                                                                                                                                                                                                                                                                          | 说明                                               |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| redis_standalone   | health_redis_standalone_set_key<br/>health_redis_standalone_get_value<br/>health_redis_standalone_alert<br/>health_redis_standalone_exit   | health_redis_standalone_alert{msg="ok"} 0<br/>health_redis_standalone_exit 0                                                                                                                                                                                                | alert是shell执行过程中业务是否出错的总指标，类似程序日志，msg可以自定义<br/>  |
| redis_master_slave | health_redis_master_slave_set_master<br/>health_redis_master_slave_get_slave<br/>health_redis_master_slave_exit<br/>health_redis_master_slave_alert | health_redis_master_slave_alert{msg="set_master ok ,get_slave sts_db_redis_slave_rop_cloudctl_0.svc_db_redisslave_rop_cloudctl.db ERROR: run rediscli failed ,get_slave sts_db_redis_slave_rop_cloudctl_1.svc_db_redisslave_rop_cloudctl.db ERROR: run rediscli failed "} 1 ||
| mysql_standalone   | health_mysql_standalone_check_mysql_alive<br/>health_mysql_standalone_exe_sql<br/>health_mysql_standalone_exit<br/>health_mysql_standalone_alert | health_mysql_standalone_exit{msg="shell already running"} 1<br/>health_mysql_standalone_exit{msg="shell timeout"} 1                                                                                                                                                         | exit是默认外部根据shell退出码生成的指标 ，现在有超时和脚本已经运行两个msg消息    |                                |
| mongo_standalone   | health_mongo_standalone_set_data<br/>health_mongo_standalone_get_value<br/>health_mongo_standalone_exit<br/>health_mongo_standalone_alert  | | 除了alert和exit是必须的，想要生成其他指标们只需要在shell输出中按照固定格式打印即可 |                                                 |
| mongo_shard        | health_mongo_shard_set_data<br/>health_mongo_shard_get_value<br/>health_mongo_shard_exit<br/>health_mongo_shard_alert                      ||
| mongo_replicaset   | health_mongo_replicaset_set_data<br/>health_mongo_replicaset_get_value<br/>health_mongo_replicaset_exit<br/>health_mongo_replicaset_alert  | health_mongo_replicaset_alert{msg=" ,ERROR: set_data failed ,get_value 172.16.125.191 ERROR: run mongocli failed ,ERROR: get_value failed"} 1                                                                                                                               ||