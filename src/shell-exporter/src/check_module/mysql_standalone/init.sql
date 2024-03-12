CREATE USER 'exporter_user'@'%' IDENTIFIED BY '12345678';
GRANT SELECT, INSERT,UPDATE ON *.* TO 'exporter_user'@'%';

CREATE DATABASE IF NOT EXISTS mysql_blackbox_check;

GRANT SELECT, INSERT,UPDATE ON mysql_blackbox_check.* TO 'exporter_user'@'%';


CREATE TABLE IF NOT EXISTS mysql_blackbox_check.student(`s_id` VARCHAR(20),`s_name` VARCHAR(20) NOT NULL DEFAULT '',`s_birth` VARCHAR(20) NOT NULL DEFAULT '',`s_sex` VARCHAR(10) NOT NULL DEFAULT '',PRIMARY KEY(`s_id`));

insert into mysql_blackbox_check.student values('01', 'zhaolei', now(), '男');

select user,host from mysql.user;