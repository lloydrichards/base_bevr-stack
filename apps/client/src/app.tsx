import { ApiResponse } from "@repo/domain/Api";
import { Schema } from "effect";
import { useState } from "react";
import bun from "./assets/bun.svg";
import effect from "./assets/effect.svg";
import react from "./assets/react.svg";
import vite from "./assets/vite.svg";
import { Button } from "./components/ui/button";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:9000";

function App() {
  const [data, setData] = useState<typeof ApiResponse.Type | undefined>();

  async function sendRequest() {
    try {
      const req = await fetch(`${SERVER_URL}/hello`);
      const res = Schema.decodeUnknownSync(ApiResponse)(await req.json());
      setData(res);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-6">
        <img alt="Bun logo" height={64} src={bun} width={64} />
        <img alt="Effect logo" height={64} src={effect} width={64} />
        <img alt="Vite logo" height={64} src={vite} width={64} />
        <img alt="React logo" height={64} src={react} width={64} />
      </div>

      <h1 className="font-black text-5xl">bEvr</h1>
      <h2 className="font-bold text-2xl">Bun + Effect + Vite + React</h2>
      <p>A typesafe fullstack monorepo</p>
      <div className="flex items-center gap-4">
        <Button onClick={sendRequest}>Call API</Button>
      </div>
      {data && (
        <pre className="rounded-md bg-gray-100 p-4">
          <code>
            Message: {data.message} <br />
            Success: {data.success.toString()}
          </code>
        </pre>
      )}
    </div>
  );
}

export default App;
