import { useState } from "react";
import bun from "./assets/bun.svg";
import effect from "./assets/effect.svg";
import react from "./assets/react.svg";
import vite from "./assets/vite.svg";
import { ApiResponse } from "@repo/domain";
import { Button } from "./components/ui/button";
import { Schema } from "effect";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

function App() {
  const [data, setData] = useState<typeof ApiResponse.Type | undefined>();

  async function sendRequest() {
    try {
      const req = await fetch(`${SERVER_URL}/hello`);
      const res = Schema.decodeUnknownSync(ApiResponse)(await req.json());
      setData(res);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 items-center justify-center min-h-screen">
      <div className="flex items-center gap-6">
        <img src={bun} className="w-16 h-16" alt="Bun logo" />
        <img src={effect} className="w-16 h-16" alt="Effect logo" />
        <img src={vite} className="w-16 h-16" alt="Vite logo" />
        <img src={react} className="w-16 h-16" alt="React logo" />
      </div>

      <h1 className="text-5xl font-black">bEvr</h1>
      <h2 className="text-2xl font-bold">Bun + Effect + Vite + React</h2>
      <p>A typesafe fullstack monorepo</p>
      <div className="flex items-center gap-4">
        <Button onClick={sendRequest}>Call API</Button>
      </div>
      {data && (
        <pre className="bg-gray-100 p-4 rounded-md">
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
