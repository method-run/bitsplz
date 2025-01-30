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

RUN echo "=== 0 Production stage dist contents ===" && \
    ls -la .

COPY --from=builder /app/dist/ .

RUN echo "=== 1 Production stage dist contents ===" && \
    ls -la .

ENV NODE_ENV production

RUN echo "=== 2 Production stage dist contents ===" && \
    ls -la .

CMD ["node", "./index.js"]