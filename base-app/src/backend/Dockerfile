FROM node:24-alpine

WORKDIR /app

# Install tools BEFORE copying code
RUN apk update && \
    apk add --no-cache curl netcat-openbsd python3 py3-pip build-base g++

COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# chmod AFTER copy
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]
