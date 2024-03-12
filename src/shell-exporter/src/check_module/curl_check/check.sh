#!/bin/sh
# User/Password

SC_URLS=${urls}
VALUE=$(date +%s)
MSG=''

cnt_pos=1
function exec_curl_health()
{
  local IFS=','
  for url in ${SC_URLS};
  do
     echo "Start time: "`date +"%Y-%m-%d %H:%M:%S" `" request  the ${url}"
     t0=`date +%s`
     curl -w "@./curl-cfg.txt"  --connect-timeout 30000 -m 20000   -s "${url}"
     t1=`date +%s`
     let s_t2=t1-t0
     if [ $s_t2 -gt 3 ]
     then
          break
     fi
  done
  if [ $? -ne 0 ]; then
    MSG="$MSG ,ERROR: exec_curl   failed "
    return 1
  else
      MSG="$MSG ,exec_curl ok"
    return 0
  fi
}




function main(){
  starttime1=$(date "+%Y-%m-%d %H:%M:%S")
  exec_curl_health
  exit1="$?"

  echo "${starttime1} start exec_curl"

  echo "exec_curl_health $exit1"

  if [ $exit1 -ne 0  ] ;then
    echo "alert_health{\"msg\"=\"$MSG\"} 1"
  else
    echo "alert_health{\"msg\"=\"ok\"} 0"
  fi

  exit 0
}
main


