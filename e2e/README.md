# End-to-end tests

The Playwright suite starts the client and API, then checks REST, HTTP RPC,
WebSocket presence, and the full-page layout. The API gets a placeholder key
through the Playwright server configuration. Tests make no Anthropic requests.
Browser sessions run sequentially because they share server presence state.

## Run locally

From the repository root:

```bash
bun install --frozen-lockfile
bunx playwright install chromium
bun run test:e2e -- --reporter=list
```

On Linux, install browser system libraries with
`bunx playwright install chromium --with-deps`. The template CI workflow does
this before running the unit and end-to-end suites.

Outside CI, Playwright can reuse servers already listening on ports 3000 and
9000. Stop them first when checking a fresh build or different configuration.

## Run on Linux with Docker

```bash
docker build -t playwright-e2e ./e2e
docker run --rm --ipc=host -e CI=true -v "$(pwd):/work" \
  -v /work/node_modules -v /work/apps/client/node_modules \
  playwright-e2e bun run test:e2e -- --reporter=list
```

The dependency volumes keep container dependencies separate from host
installations. The image pins Playwright 1.63.0 and Bun 1.4.0. Keep the image
version aligned with `@playwright/test` in the root package manifest.

## Update visual baselines

Inspect the failed screenshot and its diff before accepting a layout change.
For macOS, update the baseline locally:

```bash
bun run test:e2e -- --update-snapshots
```

For Linux, use the Docker command above with `--update-snapshots` appended.
Commit both platform baselines in `e2e/smoke.spec.ts-snapshots/`. Run the suite
again without the update flag to verify the saved baseline.

The visual test waits for exactly one connected client. It allows a 2% pixel
difference for dynamic IDs and platform rendering. Functional assertions check
the REST response, complete RPC stream, and presence status separately.
