FROM node:24-alpine AS builder
WORKDIR /app

# Install Nginx
RUN apk add --no-cache nginx curl

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Copy Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Expose both ports (5173 for Vite, 80 for Nginx)
EXPOSE 80 5173

# Start both Nginx and Vite
CMD ["sh", "-c", "nginx && npm run dev -- --host"]
