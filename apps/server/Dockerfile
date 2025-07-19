FROM oven/bun:alpine AS base

# Step 1: Install dependencies only when needed
FROM base AS builder
RUN apk add --no-cache libc6-compat build-base
WORKDIR /app
RUN bun add turbo --global

COPY . .
RUN turbo prune server --docker

# Step 2: Rebuild the source code only when needed
FROM base AS installer
RUN apk add --no-cache libc6-compat build-base
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN bun install

COPY --from=builder /app/out/full/ .
RUN bun run build

# Step 3: Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ARG SERVER_PORT=9000
ENV SERVER_PORT=${SERVER_PORT}
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 server
USER server

COPY --from=installer /app/apps/server/dist ./server/dist
COPY --from=installer /app/apps/server/package.json ./server/package.json
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages ./packages

EXPOSE ${SERVER_PORT}

CMD ["bun", "run", "./server/dist/index.js"]