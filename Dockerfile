# Stage 1: Build
FROM node:20-bookworm AS builder

WORKDIR /app

# Enable corepack to use pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY biome.json ./
COPY src ./src

RUN pnpm install --frozen-lockfile
RUN pnpm run build
# Prune dev dependencies for production copy
RUN pnpm prune --prod

# Stage 2: Production (Distroless)
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
# Copy query files if they are not compiled into js (json files)
COPY --from=builder /app/src/server/payment/payment.queries.json ./dist/server/payment/

ENV NODE_ENV=production

CMD ["dist/server.js"]
