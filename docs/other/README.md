
# 如何加入新的组件健康检查脚本


## 指定check_module目录下存放组件健康检查模块，取名规则如下：
组件名称:mongo
部署或者链接模式： 比如mongo 分 standalone ;shardcluster;replicaset
都使用小写

mongo单节点：
mongo_standalone

## 在自定义模块目录下定义一个check.sh 和 param_schema.json
├── mongo_standalone
│   ├── check.sh  //健康检查脚本
│   └── param_schema.json  //脚本参数校验规则


### check.sh健康检查脚本
脚本里的参数和param_schema.json里的参数名字要对应，参数校验使用param_schema.json中regex字段，这个字段代表参数正则校验的表达式。
执行的时候，参数会作为env注入。
如下：
check.sh
```
#!/bin/bash
env
HOST=${mongohost}
PORT=${mongoport}
PASSWORD=${mongopassword}
```
param_schema.json
```
{
  "mongohost": {
    "type": "string",
    "regex":"^((2((5[0-5])|([0-4]\\d)))|([0-1]?\\d{1,2}))(\\.((2((5[0-5])|([0-4]\\d)))|([0-1]?\\d{1,2}))){3}$"
  },
  "mongoport": {
    "type": "int",
    "regex":"[0-9]{1,5}"
  },
  "mongopassword": {
    "type": "string",
    "regex":"[0-9a-zA-Z!@#$_&*+-;]{0,40}"
  }
}
```



## 支持自定义生成额外的metrics
只要在脚本里输出 xxx_health{"key":"value"} = 0 ，这种类型的文本，项目会自动抓取生成指标