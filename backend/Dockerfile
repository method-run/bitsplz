FROM node:18 as build-dependencies

WORKDIR /app

# Copy src and common dependencies dist
COPY backend/. ./
COPY common/dist ./common/dist
COPY common/node_modules ./common/node_modules

RUN npm install

CMD ["curl", "http://localhost:8080/api/migration"]

FROM node:18 as development

WORKDIR /app

COPY --from=build-dependencies /app/. .

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host"]

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

EXPOSE 8080

CMD ["node", "dist/index.js"]

