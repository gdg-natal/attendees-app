FROM node:24.1-alpine AS builder
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies in the container (not copying node_modules)
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/attendees-app/ /usr/share/nginx/html
