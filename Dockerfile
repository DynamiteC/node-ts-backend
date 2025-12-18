# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY biome.json ./
COPY src ./src

RUN npm ci
RUN npm run build

# Stage 2: Production (Distroless)
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# Copy query files if they are not compiled into js (json files)
COPY --from=builder /app/src/server/payment/payment.queries.json ./dist/server/payment/

ENV NODE_ENV=production

CMD ["dist/server.js"]
