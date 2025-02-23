# Base stage for shared steps
FROM node:18 as base

WORKDIR /app

COPY package*.json ./

# Development stage
FROM base as development

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host"]

# Build stage (only needed for producing the static files)
FROM base as builder

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM node:18-slim as production

WORKDIR /dist

COPY package*.json ./

RUN npm install --production

COPY --from=builder /app/dist/ .

ENV NODE_ENV production

CMD ["node", "./index.js"]