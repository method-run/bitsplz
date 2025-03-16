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

# Add debugging BEFORE build
RUN echo "=== BEFORE BUILD ===" && \
    echo "Contents of /app/src:" && \
    ls -la /app/src

RUN npm run build

# Add debugging AFTER build
RUN echo "=== AFTER BUILD ===" && \
    echo "Contents of /app/dist:" && \
    ls -la /app/dist && \
    echo "\nContents of /app/dist/src:" && \
    ls -la /app/dist/src

# Production stage
FROM node:18-slim as production

WORKDIR /app

COPY backend/package*.json ./
COPY common/package*.json ./common/

# Install dependencies
RUN npm install --production && \
    cd common && npm install --production

# Copy both backend and common dist files
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/common/dist/ ./common/dist/

ENV NODE_ENV production
EXPOSE 3000

# Add debugging
RUN echo "=== PRODUCTION STAGE FILES ===" && \
    echo "Contents of /app/dist/src:" && \
    ls -la /app/dist/src && \
    echo "\nContents of /app/common/dist:" && \
    ls -la /app/common/dist && \
    echo "\nNode module resolution paths:" && \
    node -e "console.log(module.paths)"

CMD ["node", "dist/src/index.js"]