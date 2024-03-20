#!/bin/sh


KFK_PORT=${port}
KFK_HOST=${host}
KFK_TOPIC=${topic:=kafka_blackbox_check}
KFK_TIMEOUT=${timeout:=5000}
KFK_GROUP=${group:=blackbox-healthcheck}
MSG=''
VALUE=$(date +%s)

KFK_CLI="--bootstrap-server  ${KFK_HOST}:${KFK_PORT} --topic ${KFK_TOPIC} "


function set_data_health() {
    kafka-console-producer.sh ${KFK_CLI}  <<EOF
${VALUE}
EOF
    if [ $? -ne 0 ]; then
      MSG="$MSG ,ERROR: set_data  set ${VALUE} failed "
      return 1
    elses
        MSG="$MSG ,set_data ok"
      return 0
    fi
}

function get_value_health(){
    get_shell=$(kafka-console-consumer.sh ${KFK_CLI} --group ${KFK_GROUP} --max-messages 1 --timeout-ms ${KFK_TIMEOUT}> /tmp/${KFK_HOST} )
    if [ $? -ne 0  ]; then
          MSG="$MSG ,get_value ${KFK_HOST} ERROR: run kafkacli failed "
    else
          get_value=$(cat /tmp/${KFK_HOST} |grep -o ${VALUE})
          if [ "${get_value}" != "${VALUE}" ];then
                MSG="$MSG ,get_value ${KFK_HOST} ERROR: set_value ne get_value (${VALUE} ne ${get_value})"
          fi
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

function main(){
  starttime1=$(date "+%Y-%m-%d %H:%M:%S")
  get_value_health &
  exit1="$?"
  sleep 2
  starttime2=$(date "+%Y-%m-%d %H:%M:%S")
  set_data_health
  exit2="$?"

  echo "${starttime1} start get_value_health"
  echo "${starttime2} start set_data_health"
  echo "get_value_health $exit1"
  echo "set_data_health $exit2"

  if [ $exit1 -ne 0  ] || [  $exit2 -ne 0 ];then
    echo "alert_health{\"msg\"=\"$MSG\"} 1"
  else
    echo "alert_health{\"msg\"=\"ok\"} 0"
  fi

  exit 0
}
main

