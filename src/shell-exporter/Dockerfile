FROM node:14.20.1-slim AS   build

WORKDIR /home/src

ADD src /home/src

COPY package.json /home/

RUN cd /home/ &&  npm cache clean -f &&  npm install .

FROM node:14.20.1-slim

WORKDIR /home/src

COPY --from=build /home /home

RUN apt update  -y  && apt install net-tools vim  bc jq  redis-tools curl  libncurses5   libaio1    -y   

RUN apt-get install default-mysql-client   -y

RUN apt-get install mongo-tools -y

#ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini-amd64 /usr/local/bin/tini
COPY tini-amd64 /usr/local/bin/tini

RUN chmod +x /usr/local/bin/tini

ENTRYPOINT ["/usr/local/bin/tini", "--"]

ENV PATH=/opt/kafka/bin:/home/src/bin:$PATH

CMD ["node", "server.js" ]
