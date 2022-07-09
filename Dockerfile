
FROM node:14-alpine

WORKDIR /app

COPY ["package.json", "pm2.json", "package-lock.json*","./"]

RUN npm install

RUN npm install - g pm2

COPY . .

CMD ["pm2-runtime","start","pm2.json"]