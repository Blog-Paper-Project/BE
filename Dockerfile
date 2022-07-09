
FROM node:14-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json*","./"]

RUN npm install

RUN npm install -g nodemon

RUN npm install pm2 -g

COPY . .

CMD ["node" , "server.js"]