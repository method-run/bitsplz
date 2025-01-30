# Base stage for shared steps
FROM node:18 as base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Development stage
FROM base as development

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host"]

# Build stage
FROM base as builder

RUN npm run build
