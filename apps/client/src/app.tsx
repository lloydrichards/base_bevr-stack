import { Result, useAtom } from "@effect-atom/atom-react";
import bun from "./assets/bun.svg";
import effect from "./assets/effect.svg";
import react from "./assets/react.svg";
import vite from "./assets/vite.svg";
import { Button } from "./components/ui/button";
import { ResponseCard } from "./components/ui/response-card";
import { helloAtom, tickAtom } from "./lib/atom";

function App() {
  const [result, search] = useAtom(tickAtom);
  const [response, getHello] = useAtom(helloAtom);
  const event = Result.getOrElse(result, () => null);

  const handleSearch = () => {
    search({ abort: false });
  };

  const handleApiCall = () => {
    getHello();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-8 p-4">
      <div className="flex items-center gap-6">
        <img alt="Bun logo" height={64} src={bun} width={64} />
        <img alt="Effect logo" height={64} src={effect} width={64} />
        <img alt="Vite logo" height={64} src={vite} width={64} />
        <img alt="React logo" height={64} src={react} width={64} />
      </div>

      <div className="text-center">
        <h1 className="font-black text-5xl">bEvr</h1>
        <h2 className="font-bold text-2xl">Bun + Effect + Vite + React</h2>
        <p className="text-gray-600">A typesafe fullstack monorepo</p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-lg">REST API</h3>
            <Button className="w-full" onClick={handleApiCall} size="lg">
              Call REST API
            </Button>
          </div>
          {Result.builder(response)
            .onSuccess((data) => (
              <ResponseCard state="completed" title="REST API Response">
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
              <ResponseCard state="error" title="REST API Response">
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
              <ResponseCard title="REST API Response">
                Click the button above to test the REST API
              </ResponseCard>
            ))
            .orNull()}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-lg">RPC API</h3>
            <Button className="w-full" onClick={handleSearch} size="lg">
              Call RPC API
            </Button>
          </div>

          {event ? (
            <ResponseCard
              state={event.event._tag === "end" ? "completed" : "loading"}
              title="RPC API Response"
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
            <ResponseCard title="RPC API Response">
              Click the button above to test the RPC API
            </ResponseCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
