# Base stage for shared steps
FROM node:18 as base

WORKDIR /app

# Copy package files for both frontend and common
COPY frontend/package*.json ./
COPY common/package*.json ./common/

# Install dependencies for both
RUN npm install
RUN cd common && npm install

# Copy source files
COPY frontend/ .
COPY common/ ./common/

# Development stage
FROM base as development

# Build common files
RUN cd common && npm run build

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host"]

# Build stage
FROM base as builder

# Build common files
RUN cd common && npm run build

RUN npm run build
