import { Hono } from "hono";
import { cors } from "hono/cors";
import { ApiResponse } from "@repo/domain";
import { Schema } from "effect";

export const app = new Hono()

  .use(cors())

  .get("/", (c) => {
    return c.text("Hello Hono!");
  })

  .get("/hello", async (c) => {
    const data: typeof ApiResponse.Type = {
      message: "Hello bhEvr!",
      success: true,
    };
    return c.json(Schema.encodeSync(ApiResponse)(data), { status: 200 });
  });

export default app;
