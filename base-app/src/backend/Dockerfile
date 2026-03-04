FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache curl && npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
