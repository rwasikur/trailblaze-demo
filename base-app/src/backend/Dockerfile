FROM node:18-alpine

WORKDIR /app

# CRITICAL: Install health check tools BEFORE copying code
RUN apk update && \
    apk add --no-cache curl netcat-openbsd python3 py3-pip

COPY package*.json ./
RUN npm install

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages

# Copy application code
COPY . .

# CRITICAL: chmod MUST come AFTER COPY
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]
