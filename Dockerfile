FROM node:slim

WORKDIR /app

RUN chmod -R 777 ./

COPY --chown=node:node package.json .
COPY --chown=node:node package-lock.json .
RUN npm install
COPY --chown=node:node . .

CMD ["npm","start"]
