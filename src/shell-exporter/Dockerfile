FROM node:14.20.1-slim AS   build

WORKDIR /home/src

ADD src /home/src

COPY package.json /home/

RUN cd /home/ &&  npm cache clean -f &&  npm install .

FROM node:14.20.1-slim

WORKDIR /home/src

COPY --from=build /home /home

ADD bin /home/bin

RUN apt update  -y  && apt install net-tools vim  bc jq  redis-tools curl  libncurses5   libaio1   -y   

ADD jdk-8u391-linux-x64.tar.gz /usr/lib/jdk/

ENV JAVA_HOME=/usr/lib/jdk/jdk1.8.0_391

ENV CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
# RUN apt-get clean && rm -rf /var/lib/apt/lists/* && echo "deb http://security.debian.org/debian-security stretch/updates main" >> /etc/apt/sources.list && apt-get update &&  apt-get install  openjdk-8-jdk -y
#RUN  apt-get clean && rm -rf /var/lib/apt/lists/* && apt update  -y  &&  apt install apt-transport-https ca-certificates wget dirmngr gnupg software-properties-common -y &&  wget -qO - https://adoptopenjdk.jfrog.io/adoptopenjdk/api/gpg/key/public | sudo apt-key add - && add-apt-repository --yes https://adoptopenjdk.jfrog.io/adoptopenjdk/deb/  && apt-get update && apt-get install adoptopenjdk-8-hotspot -y && apt autoremove --purge software-properties-common -y

RUN apt-get install default-mysql-client   -y

# RUN apt-get install mongo-tools -y

ADD bin/kafka_2.13-2.8.1 /opt/kafka

#ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini-amd64 /usr/local/bin/tini
COPY tini-amd64 /usr/local/bin/tini

RUN chmod +x /usr/local/bin/tini

ENTRYPOINT ["/usr/local/bin/tini", "--"]

ENV PATH=/opt/kafka/bin:$JAVA_HOME/bin:/home/bin:$PATH

CMD ["node", "server.js" ]
