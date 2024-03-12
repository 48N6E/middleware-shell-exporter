#!/bin/bash

MONGO_HOST=${host}
MONGO_PORT=${port}
MONGO_PWD=${passwd}
MONGO_USER=${user}
MONGO_RS=${replicaSet}
MONGO_DB=${db}
MONGO_AUTH_SOURCE=${authSource}

VALUE=$(date +%s)
MSG=''
MONGO_CLI=""
if [ -z "${MONGO_PWD}" ]; then
    MONGO_CLI="mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?replicaSet=${MONGO_RS}&readPreference=secondaryPreferred&authSource=${MONGO_AUTH_SOURCE}"
else
    MONGO_CLI="mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?replicaSet=${MONGO_RS}&readPreference=secondaryPreferred&authSource=${MONGO_AUTH_SOURCE}"
fi


function set_data_health() {
    mongo  --quiet  ${MONGO_CLI}   --eval "db.mongo_black_check.deleteOne({_id:10})"
    if [ $? -ne 0 ]; then
      MSG="$MSG ,ERROR: delete_data failed"
      return 1
    else
        MSG="$MSG ,delete_data ok"
        mongo --quiet ${MONGO_CLI} --eval "db.mongo_black_check.insert({_id:10,check:"${VALUE}"})"
        if [ $? -ne 0 ]; then
          MSG="$MSG ,ERROR: set_data failed"
          return 1
        else
            MSG="$MSG ,set_data ok"
          return 0
        fi
    fi
}

function get_value_health(){
    get_value=$(mongo --quiet ${MONGO_CLI} --eval "db.mongo_black_check.findOne({_id:10},{_id:0})" | jq .check)
    if [ $? -ne 0  ]; then
          MSG="$MSG ,get_value ${MONGO_HOST} ERROR: run mongocli failed "
    elif [ "${get_value}" != "${VALUE}" ];then
          MSG="$MSG ,get_value ${MONGO_HOST}  ERROR: set_value ne get_value (${VALUE} ne ${get_value})"
    fi
    echo "$MSG" | grep "get_value.*ERROR"
    if [ $? -ne 0 ]; then
      MSG="$MSG ,get_value ok"
      return 0
    else
      MSG="$MSG ,ERROR: get_value failed"
      return 1
    fi

}


function  main() {
   starttime1=$(date "+%Y-%m-%d %H:%M:%S")
   set_data_health
   exit1="$?"
   starttime2=$(date "+%Y-%m-%d %H:%M:%S")
   get_value_health
   exit2="$?"

   echo "${starttime1} start set_data"
   echo "${starttime2} start get_value"
   echo "set_data_health $exit1"
   echo "get_value_health $exit2"


   if [ $exit1 -ne 0  ]  ||[ $exit2 -ne 0 ] ;then
     echo "alert_health{\"msg\"=\"$MSG\"} 1"
   else
     echo "alert_health{\"msg\"=\"ok\"} 0"
   fi

   exit 0
}

main