
FROM node:16

WORKDIR /app

COPY ["package.json", "package-lock.json*","./"]

RUN npm install

RUN npm install -g nodemon

COPY . .

CMD ["nodemon", "-L","server.js"]