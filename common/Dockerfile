# Base stage for shared steps
FROM node:18 as prod-deps

WORKDIR /app

COPY common/package*.json ./

# Install dependencies
RUN npm install --omit=dev

FROM prod-deps as builder

COPY common/. ./

# Build common files
CMD ["npm", "run", "build"]

