FROM oven/bun:1.4.0 AS bun
FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx
