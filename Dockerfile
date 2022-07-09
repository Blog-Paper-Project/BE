
FROM keymetrics/pm2:latest-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json*", "pm2.json","./"]

RUN npm install

RUN npm install pm2 -g

COPY . .

CMD ["pm2-runtime","start","pm2.json"]