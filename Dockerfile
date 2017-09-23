FROM node:latest

WORKDIR /app

COPY package.json package-lock.json .

RUN npm install
# PhantomJS should get installed with the command above

COPY powercycle.js run.js speedtest.js waiter.js phantom .

CMD ["npm", "start"]