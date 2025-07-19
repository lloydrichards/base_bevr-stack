FROM oven/bun:alpine AS base

# Step 1: Install dependencies only when needed
FROM base AS builder
RUN apk add --no-cache libc6-compat build-base
WORKDIR /app
RUN bun add turbo --global

COPY . .
RUN turbo prune client --docker

# Step 2: Rebuild the source code only when needed
FROM base AS installer
RUN apk add --no-cache libc6-compat build-base
WORKDIR /app

ARG SERVER_HOST=localhost
ARG SERVER_PORT=9000
ENV VITE_SERVER_URL=http://${SERVER_HOST}:${SERVER_PORT}

COPY --from=builder /app/out/json/ .
RUN bun install

COPY --from=builder /app/out/full/ .
RUN bun run build

# Step 3: Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ARG CLIENT_PORT
ENV CLIENT_PORT=${CLIENT_PORT}
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 client
USER client

COPY --from=installer /app/apps/client/dist ./dist
COPY --from=installer /app/apps/client/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

EXPOSE ${CLIENT_PORT}

CMD bun run preview --port ${CLIENT_PORT} --host