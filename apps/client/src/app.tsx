import { Result, useAtom } from "@effect-atom/atom-react";
import { useEffect, useState } from "react";
import bun from "./assets/bun.svg";
import effect from "./assets/effect.svg";
import react from "./assets/react.svg";
import vite from "./assets/vite.svg";
import { ChatBox } from "./components/chat-box";
import { Button } from "./components/ui/button";
import { PresencePanel } from "./components/ui/presence-panel";
import { ResponseCard } from "./components/ui/response-card";
import { helloAtom, tickAtom } from "./lib/atom";

function App() {
  const [result, search] = useAtom(tickAtom);
  const [response, getHello] = useAtom(helloAtom);
  const event = Result.getOrElse(result, () => null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDark(shouldUseDark);
  }, []);

  const handleSearch = () => {
    search({ abort: false });
  };

  const handleApiCall = () => {
    getHello();
  };

  const handleThemeToggle = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-8 p-4">
      <button
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-foreground shadow-sm transition hover:bg-accent"
        onClick={handleThemeToggle}
        role="switch"
        type="button"
      >
        <span className="text-xs font-semibold">
          {isDark ? "Dark" : "Light"}
        </span>
        <span className="relative h-5 w-9 rounded-full bg-muted">
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-primary transition ${
              isDark ? "left-4" : "left-0.5"
            }`}
          />
        </span>
      </button>
      <div className="flex items-center gap-6">
        <img alt="Bun logo" height={64} src={bun} width={64} />
        <img
          alt="Effect logo"
          height={64}
          src={effect}
          width={64}
          className="dark:invert"
        />
        <img alt="Vite logo" height={64} src={vite} width={64} />
        <img alt="React logo" height={64} src={react} width={64} />
      </div>

      <div className="text-center">
        <h1 className="font-black text-5xl">bEvr</h1>
        <h2 className="font-bold text-2xl">Bun + Effect + Vite + React</h2>
        <p className="text-muted-foreground">A typesafe fullstack monorepo</p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 auto-rows-[30rem] lg:auto-rows-[22rem] lg:grid-cols-2">
        <div className="h-full">
          <ChatBox />
        </div>

        <div className="h-full">
          <PresencePanel className="h-full" />
        </div>

        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="font-semibold text-foreground text-lg">REST API</h3>
            <Button className="w-full" onClick={handleApiCall} size="lg">
              Call REST API
            </Button>
          </div>
          {Result.builder(response)
            .onSuccess((data) => (
              <ResponseCard
                state="completed"
                title="REST API Response"
                className="flex-1"
              >
                <pre>
                  <code>
                    Message: {data.message}
                    {"\n"}
                    Success: {data.success.toString()}
                  </code>
                </pre>
              </ResponseCard>
            ))
            .onFailure((error) => (
              <ResponseCard
                state="error"
                title="REST API Response"
                className="flex-1"
              >
                <pre>
                  <code>
                    Error: {error._tag}
                    {"\n"}
                    Details: {JSON.stringify(error ?? {}, null, 2)}
                  </code>
                </pre>
              </ResponseCard>
            ))
            .onInitial(() => (
              <ResponseCard title="REST API Response" className="flex-1">
                Click the button above to test the REST API
              </ResponseCard>
            ))
            .orNull()}
        </div>

        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="font-semibold text-foreground text-lg">RPC API</h3>
            <Button className="w-full" onClick={handleSearch} size="lg">
              Call RPC API
            </Button>
          </div>

          {event ? (
            <ResponseCard
              state={event.event._tag === "end" ? "completed" : "loading"}
              title="RPC API Response"
              className="flex-1"
            >
              <pre>
                <code>
                  Event: {event.event._tag}
                  {"\n"}
                  Message: {event.text}
                </code>
              </pre>
            </ResponseCard>
          ) : (
            <ResponseCard title="RPC API Response" className="flex-1">
              Click the button above to test the RPC API
            </ResponseCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
