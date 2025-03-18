# Base stage for shared steps
FROM node:18 as build-dependencies

WORKDIR /app

# Copy src and common dependencies dist
COPY frontend/. ./
COPY common/dist ./common/dist

RUN npm install

FROM node:18 as development

WORKDIR /app

COPY --from=build-dependencies /app/. .

EXPOSE 4173

CMD ["npm", "run", "dev", "--", "--port", "4173", "--host"]

# Build stage
FROM node:18 as production-build

WORKDIR /app

COPY --from=build-dependencies /app/. .

ENV NODE_ENV production

RUN npm run build

FROM node:18 as production

WORKDIR /app

COPY --from=production-build /app/common ./common
COPY --from=production-build /app/package*.json .
COPY --from=production-build /app/dist ./dist

ENV NODE_ENV production

RUN npm install --omit=dev
