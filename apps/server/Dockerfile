FROM oven/bun:1.4.0 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build --filter=server

FROM oven/bun:1.4.0-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
USER bun
COPY --from=builder --chown=bun:bun /app/apps/server/dist/index.js ./index.js
EXPOSE 9000
CMD ["bun", "run", "index.js"]
