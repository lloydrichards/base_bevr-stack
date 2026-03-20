import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import App from "./app";

// Mock the atom hooks to avoid real API calls
vi.mock("@effect-atom/atom-react", () => ({
  Result: {
    getOrElse: vi.fn((_result: unknown, fallback: () => unknown) => {
      return fallback();
    }),
    match: vi.fn(
      (_result: unknown, handlers: Record<string, () => unknown>) => {
        return handlers["onInitial"] ? handlers["onInitial"]() : null;
      },
    ),
    builder: vi.fn(() => ({
      onSuccess: vi.fn().mockReturnThis(),
      onFailure: vi.fn().mockReturnThis(),
      onInitial: vi.fn().mockReturnThis(),
      orNull: vi.fn(() => null),
    })),
    isSuccess: vi.fn(() => false),
    isInitial: vi.fn(() => true),
    isFailure: vi.fn(() => false),
    isWaiting: vi.fn(() => false),
  },
  useAtom: vi.fn(() => [{ _tag: "Initial" }, vi.fn()]),
  useAtomSet: vi.fn(() => vi.fn()),
}));

vi.mock("./lib/atom", () => ({
  helloAtom: vi.fn(),
  tickAtom: vi.fn(),
  runtime: {
    fn: vi.fn(() => vi.fn()),
  },
}));

vi.mock("./lib/web-socket-client", () => ({
  WebSocketClient: {
    mutation: vi.fn(() => vi.fn()),
  },
  presenceSubscriptionAtom: vi.fn(),
}));

describe("App", () => {
  test("renders without crashing", async () => {
    const screen = await render(<App />);
    await expect.element(screen.getByText("bEvr")).toBeVisible();
  });

  test("displays the subtitle", async () => {
    const screen = await render(<App />);
    await expect
      .element(screen.getByText("Bun + Effect + Vite + React"))
      .toBeVisible();
  });

  test("displays the description", async () => {
    const screen = await render(<App />);
    await expect
      .element(screen.getByText("A typesafe fullstack monorepo"))
      .toBeVisible();
  });

  test("renders REST API section", async () => {
    const screen = await render(<App />);
    const restHeading = screen.getByText(/^REST API$/);
    restHeading.element().scrollIntoView({ block: "center" });
    await expect.element(restHeading).toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: "Call REST API" }))
      .toBeVisible();
  });

  test("renders RPC API section", async () => {
    const screen = await render(<App />);
    const rpcHeading = screen.getByText(/^RPC API$/);
    rpcHeading.element().scrollIntoView({ block: "center" });
    await expect.element(rpcHeading).toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: "Call RPC API" }))
      .toBeVisible();
  });

  test("renders all technology logos", async () => {
    const screen = await render(<App />);
    await expect.element(screen.getByAltText("Bun logo")).toBeVisible();
    await expect.element(screen.getByAltText("Effect logo")).toBeVisible();
    await expect.element(screen.getByAltText("Vite logo")).toBeVisible();
    await expect.element(screen.getByAltText("React logo")).toBeVisible();
  });
});
