#!/bin/sh
# User/Password

MYSQL_USER=${user}
MYSQL_PWD=${passwd}
export MYSQL_PWD=${passwd}
MYSQL_PORT=${port}
MYSQL_HOST=${host}
MYSQL_TIMEOUT=${timeout}
MYSQL_SCRIPT=""
MYSQL_SCRIPT=check.sql
MSG=''
function check_mysql_alive_health() {
    mysqladmin -u"${MYSQL_USER}" --port "${MYSQL_PORT}"  -h"${MYSQL_HOST}" --connect_timeout="${MYSQL_TIMEOUT}" ping
    if [ $? -ne 0 ]; then
      MSG="$MSG ,ERROR: ping failed "
      return 1
    else
      MSG="$MSG ,ping ok"
      return 0
    fi
}

function exe_sql_health(){
#  nohup mysql --no-defaults -BN --wait --connect-timeout="${MYSQL_TIMEOUT}" --host="${MYSQL_HOST}" --port="${MYSQL_PORT}" --user="${MYSQL_USER}"  < "${MYSQL_SCRIPT}" ;   echo -e '\n123'
  mysql --no-defaults -BN --connect-timeout="${MYSQL_TIMEOUT}" --host="${MYSQL_HOST}" --port="${MYSQL_PORT}" --user="${MYSQL_USER}"  -e 'show processlist' | grep 'update mysql_blackbox_check.student set s_birth=now() WHERE s_id=01' |grep -v grep
  if [ $? -ne 0  ]; then
      mysql --no-defaults -BN --connect-timeout="${MYSQL_TIMEOUT}" --host="${MYSQL_HOST}" --port="${MYSQL_PORT}" --user="${MYSQL_USER}"  -e 'update mysql_blackbox_check.student set s_birth=now() WHERE s_id=01;'
      mysql --no-defaults -BN --connect-timeout="${MYSQL_TIMEOUT}" --host="${MYSQL_HOST}" --port="${MYSQL_PORT}" --user="${MYSQL_USER}"  -e 'select * from mysql_blackbox_check.student where s_id=01;'
      selectifok=$?
      mysql --no-defaults -BN --connect-timeout="${MYSQL_TIMEOUT}" --host="${MYSQL_HOST}" --port="${MYSQL_PORT}" --user="${MYSQL_USER}"  -e 'show processlist' | grep 'update mysql_blackbox_check.student set s_birth=now() WHERE s_id=01' |grep -v grep
      if [ $? -ne 0  ] && [  ${selectifok} -eq 0 ]; then
          MSG="$MSG ,exe sql ok"
        return 0
      else
        MSG="$MSG ,ERROR: exe_sql failed "
        return 1
      fi
  else
    MSG="$MSG ,ERROR: update exec already exists "
    return 1
  fi
}

function main(){
  sleep 15
  starttime1=$(date "+%Y-%m-%d %H:%M:%S")
  check_mysql_alive_health
  exit1="$?"
  starttime2=$(date "+%Y-%m-%d %H:%M:%S")
  exe_sql_health
  exit2="$?"

  echo "${starttime1} start check_mysql_alive"
  echo "${starttime2} start exe_sql"
  echo "check_mysql_alive_health $exit1"
  echo "exe_sql_health $exit2"

  if [ $exit1 -ne 0  ] || [  $exit2 -ne 0 ];then
    echo "alert_health{\"msg\"=\"$MSG\"} 1"
  else
    echo "alert_health{\"msg\"=\"ok\"} 0"
  fi

  exit 0
}
main

