
FROM node:14-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json*","./"]

RUN npm install

RUN npm install -g nodemon

COPY . .

CMD ["nodemon", "-L","server.js"]