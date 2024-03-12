#!/bin/sh
# User/Password


REDIS_PWD=${passwd}
REDIS_MASTER=${master}
REDIS_SLAVES=${slave}
REDIS_KEY=${key:=redis_blackbox_check}

MSG=''
REDIS_CLI=""
if [ -z "${REDIS_PWD}" ]; then
    REDIS_CLI="redis-cli   "
else
    REDIS_CLI="redis-cli --no-auth-warning -a ${REDIS_PWD}  "
fi

VALUE=$(date +%s)

function set_master_health(){
    redis_master_host=$(echo "${REDIS_MASTER}" | cut -d':' -f 1)
    redis_master_port=$(echo "${REDIS_MASTER}" | cut -d':' -f 2)
    $REDIS_CLI  -h "${redis_master_host}" -p "${redis_master_port}"   set ${REDIS_KEY} "${VALUE}"
    if [ $? -ne 0 ]; then
      MSG="$MSG ,ERROR: set_master ${redis_master_host} failed "
      return 1
    else
        MSG="$MSG ,set_master ok"
      return 0
    fi
}

function get_slave_health(){
  local IFS=','
  for redis_node in ${REDIS_SLAVES};
          do
              if [[ -n "${redis_node}" ]]; then
                  eval $(echo "${redis_node}" | awk -F[\:] '{ printf("redis_node_ip=%s\nredis_node_port=%s\n",$1,$2) }')
                  if [[ -n "${redis_node_ip}" &&  -n "${redis_node_port}" ]]; then
                      echo  "Checking ${redis_node_ip}:${redis_node_port}"
                      if [ -z "${REDIS_PWD}" ]; then
                          get_value=$(redis-cli  -h "${redis_node_ip}" -p "${redis_node_port}"  get ${REDIS_KEY})
                      else
                          get_value=$(redis-cli --no-auth-warning -a "${REDIS_PWD}" -h "${redis_node_ip}" -p "${redis_node_port}"  get ${REDIS_KEY})
                      fi
                      if [ $? -ne 0  ]; then
                            MSG="$MSG ,get_slave ${redis_node_ip} ERROR: run rediscli failed "
                      elif [ "${get_value}" != "${VALUE}" ];then
                          if [ -z "${REDIS_PWD}" ]; then
                              redis-cli  -h "${redis_node_ip}" -p "${redis_node_port}"  info
                          else
                              redis-cli --no-auth-warning -a "${REDIS_PWD}" -h "${redis_node_ip}" -p "${redis_node_port}"  info
                          fi
                            MSG="$MSG ,get_slave ${redis_node_ip} ERROR: set_value ne get_value (${VALUE} ne ${get_value}),key is ${REDIS_KEY}"
                      fi
                  fi
              fi
          done
      echo "$MSG" | grep "get_slave.*ERROR"
      if [ $? -ne 0 ]; then
        MSG="$MSG ,get_slave ok"
        return 0
      else
        MSG="$MSG "
        return 1
      fi
}




function main(){
  starttime1=$(date "+%Y-%m-%d %H:%M:%S")
  set_master_health
  exit1="$?"
  sleep 0.4
  starttime2=$(date "+%Y-%m-%d %H:%M:%S")
  get_slave_health
  exit2="$?"

  echo "${starttime1} start set_master"
  echo "${starttime2} start get_slave"
  echo "set_master_health $exit1"
  echo "get_slave_health $exit2"

  if [ $exit1 -ne 0 ] ||[ $exit2 -ne 0 ] ;then
    echo "alert_health{\"msg\"=\"$MSG\"} 1"
  else
    echo "alert_health{\"msg\"=\"ok\"} 0"
  fi

  exit 0
}
main

