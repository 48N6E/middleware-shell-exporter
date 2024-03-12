#!/bin/sh
# User/Password


REDIS_PWD=${passwd}
REDIS_PORT=${port}
REDIS_HOST=${host}
REDIS_KEY=${key:=redis_blackbox_check}
VALUE=$(date +%s)
MSG=''
REDIS_CLI=""
if [ -z "${REDIS_PWD}" ]; then
    REDIS_CLI="redis-cli   "
else
    REDIS_CLI="redis-cli --no-auth-warning -a ${REDIS_PWD}  "
fi


function set_key_health() {
    $REDIS_CLI  -h "${REDIS_HOST}" -p "${REDIS_PORT}"   set ${REDIS_KEY} "${VALUE}"
    if [ $? -ne 0 ]; then
      MSG="$MSG ,ERROR: set_key ${REDIS_HOST} failed"
      return 1
    else
        MSG="$MSG ,set_key ok"
      return 0
    fi
}

function get_value_health(){
    get_value=$($REDIS_CLI  -h "${REDIS_HOST}" -p "${REDIS_PORT}"    get ${REDIS_KEY})
    if [ $? -ne 0  ]; then
          MSG="$MSG ,get_value ${REDIS_HOST} ERROR: run rediscli failed "
    elif [ "${get_value}" != "${VALUE}" ];then
          $REDIS_CLI  -h "${REDIS_HOST}" -p "${REDIS_PORT}" info
          MSG="$MSG ,get_value ${REDIS_HOST} ERROR: set_value ne get_value (${VALUE} ne ${get_value})"
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
  set_key_health
  exit1="$?"
  starttime2=$(date "+%Y-%m-%d %H:%M:%S")
  get_value_health
  exit2="$?"

  echo "${starttime1} start set_key"
  echo "${starttime2} start get_value"
  echo "set_key_health $exit1"
  echo "get_value_health $exit2"

  if [ $exit1 -ne 0  ] || [  $exit2 -ne 0 ];then
    echo "alert_health{\"msg\"=\"$MSG\"} 1"
  else
    echo "alert_health{\"msg\"=\"ok\"} 0"
  fi

  exit 0
}
main

