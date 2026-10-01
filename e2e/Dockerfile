FROM mcr.microsoft.com/playwright:v1.63.0-noble

# Install Bun
RUN npm install -g bun@1.4.0

WORKDIR /work

# Default command runs tests
ENTRYPOINT ["sh", "-c", "bun install --frozen-lockfile && exec \"$@\"", "--"]
CMD ["bun", "run", "test:e2e"]
