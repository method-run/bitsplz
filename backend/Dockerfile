# Base stage for shared steps
FROM node:18 as base

WORKDIR /app

# Copy package files for both backend and common
COPY backend/package*.json ./
COPY common/package*.json ./common/

# Install dependencies for both
RUN npm install
RUN cd common && npm install

# Copy source files
COPY backend/ .
COPY common/ ./common/

# Development stage
FROM base as development

# Build common files
RUN cd common && npm run build

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host"]

# Build stage (only needed for producing the static files)
FROM base as builder

# Build common files
RUN cd common && npm run build

RUN npm run build

# Production stage
FROM node:18-slim as production

WORKDIR /dist

COPY backend/package*.json ./
COPY common/package*.json ./common/

RUN npm install --production
RUN cd common && npm install --production

COPY --from=builder /app/dist/ .
COPY --from=builder /app/common/dist/ ./common/dist/

ENV NODE_ENV production

CMD ["node", "./index.js"]