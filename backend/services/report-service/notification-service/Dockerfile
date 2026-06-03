FROM node:20-alpine
WORKDIR /app

# Copy package files and install deps
COPY notification-service/package*.json ./
RUN npm install --production=false

# Copy the service source AND the shared folder
COPY notification-service/ .
COPY shared/ ./shared/

RUN npm run build
EXPOSE $PORT
CMD ["node", "dist/index.js"]
