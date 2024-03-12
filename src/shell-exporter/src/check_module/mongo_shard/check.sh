#!/bin/bash

MONGO_HOST=${host}
MONGO_PORT=${port}
MONGO_PWD=${passwd}
MONGO_USER=${user}
MONGO_TABLE=${shardkey}
MONGO_DB=${db}
MONGO_AUTH_SOURCE=${authSource}

VALUE=$(date +%s)
MSG=''
MONGO_CLI=""
if [ -z "${MONGO_PWD}" ]; then
    MONGO_CLI="mongo  --quiet  "mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_AUTH_SOURCE}" "
else
    MONGO_CLI="mongo --quiet  "mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_AUTH_SOURCE}"  "
fi

function set_data_health() {
    get_old_value=$(${MONGO_CLI}   --eval "db.$1.findOne({_id:10})"|jq .check)
    if [ -z ${get_old_value} ] || [ ${get_old_value} = 'null' ];then
      ${MONGO_CLI}    --eval "db.$1.insert({_id:10,$2,check:"${VALUE}"})"
    else
      ${MONGO_CLI}    --eval "db.$1.update({_id:10},{_id:10,$2,check:"${VALUE}"})"
    fi
    if [ $? -ne 0 ]; then
      MSG="$MSG ,ERROR: set_data failed"
      return 1
    else
        MSG="$MSG ,set_data ok"
      return 0
    fi
}

function get_value_health(){
    get_value=$(${MONGO_CLI}   --eval "db.$1.findOne({_id:10,$2})" |jq .check)
    if [ $? -ne 0  ]; then
          MSG="$MSG ,get_value ${MONGO_HOST} run mongocli db.sc_eu.findOne ERROR"
    elif [ "${get_value}" != "${VALUE}" ];then
          MSG="$MSG ,get_value ${MONGO_HOST} set value is "${VALUE}" ,get value is "${get_value}" ERROR"
    fi
    echo "$MSG" | grep "get_value.*ERROR"
    if [ $? -ne 0 ]; then
      MSG="$MSG ,get_value ok"
      return 0
    else
      MSG="$MSG ,get_value ERROR"
      return 1
    fi
}

exit1=0
exit2=0
function  main() {
  let keylength=$(echo   ${MONGO_TABLE} | jq 'length')
  for i in $(seq ${keylength});do
    tablename=$(echo ${MONGO_TABLE} | jq .[$i-1].table|grep -E -o "[a-zA-Z_-]{1,40}")
    shardkey=$(echo ${MONGO_TABLE} | jq .[$i-1].shardkey |grep -E -o "[a-zA-Z_-]{1,40}")
    shardvalue=$(echo ${MONGO_TABLE} | jq .[$i-1].${shardkey})

    if [[ -z "${tablename}" || -z "${shardkey}" || -z "${shardvalue}" ]]; then
      MSG="$MSG , tablename or shardkey or shardvalue is null  ERROR"
      exit1+=1
    else

      echo ${tablename} ${shardkey} ${shardvalue}
      starttime1=$(date "+%Y-%m-%d %H:%M:%S")
      set_data_health ${tablename} ${shardkey}:${shardvalue}
      exit1+="$?"
      sleep 2
      starttime2=$(date "+%Y-%m-%d %H:%M:%S")
      get_value_health ${tablename} ${shardkey}:${shardvalue}
      exit2+="$?"
    fi
  done
  echo "${starttime1} start set_data"
  echo "${starttime2} start get_value"
  echo "set_data_health $exit1"
  echo "get_value_health $exit2"

  if [ $exit1 -ne 0  ] || [  $exit2 -ne 0 ];then
    echo "alert_health{\"msg\"=\"$MSG\"} 1"
  else
    echo "alert_health{\"msg\"=\"ok\"} 0"
  fi

   exit 0
}

main