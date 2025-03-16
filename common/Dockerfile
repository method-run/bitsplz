# Base stage for shared steps
FROM node:18 as prod-deps

WORKDIR /app

COPY package*.json ./

# Install dependencies
CMD ["npm", "install", "--omit=dev"]

FROM prod-deps as builder

COPY . ./

# Build common files
CMD ["npm", "run", "build"]

