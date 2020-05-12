FROM node:14.2.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk update && \
  echo "http://dl-3.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && \
  echo "https://alpine.global.ssl.fastly.net/alpine/edge/main" >> /etc/apk/repositories && \
  apk add --no-cache --virtual .build-deps fftw-dev gcc g++ make && \
  apk add --no-cache libc6-compat vips-dev && \
  npm ci --only=production && \
  apk del .build-deps && \
  rm -rf /var/cache/apk/*

COPY src ./

EXPOSE 3000

CMD [ "node", "index.js" ]