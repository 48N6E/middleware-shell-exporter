FROM node:10.15.3-alpine

WORKDIR /

RUN apk add curl

COPY src/*.js /home/

COPY src/*.json /home/

RUN cd /home/ && npm install .

CMD ["node", "/home/app.js", "--config", "/home/config.json", "push"]
