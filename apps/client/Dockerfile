FROM oven/bun:1.4.0 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
ARG VITE_SERVER_URL=http://localhost:9000
ARG VITE_WS_URL=ws://localhost:9000/ws
ENV VITE_SERVER_URL=${VITE_SERVER_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
RUN bun run build --filter=client

FROM nginx:mainline-alpine AS runner
COPY support/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
