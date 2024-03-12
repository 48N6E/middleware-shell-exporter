# middleware-shell-exporter （[中文版](README.md)）
Middleware Shell Exporter can execute all types of scripts and push them to Prometheus (Victoriametrics).

This is a solution specifically provided for DBAs and operations personnel (DB type middleware can only be checked for health by performing a read and write once), and supports custom inspection modules.

![GitHub](https://img.shields.io/badge/license-GPL-blue.svg)

# How to deploy
* [Deployment Document](/docs/deploy/main.md)



## Existing middleware that supports inspection

* Mongo-replicaset Mongo replica deployment mode
* Mongo_shard mongo replica sharding mode
* Mongo_standalone Mongo standalone mode
* Redis_master slave redis master-slave mode
* Redis_standalone Redis standalone mode
* MySQL standalone mode、
* Curl_check curl checks the health of API interfaces
* Aliyun_ecs Convert Alibaba Cloud's disk and ECS details into metrics

## Introduction to Features

* Support custom shell generation metrics
* Support customized inspection modules
* Support monitoring, such as the number of executions, success or failure, etc
* No need for SDK to operate the database, use the official native client
* Support custom output conversion metrics

## Indicator Description

* [Indicator Example](docs/other/METRICS.md)