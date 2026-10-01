# @repo/domain

Shared types and schemas for the [bEvr stack](../../README.md), built with
Effect Schema.

## Overview

This package provides type-safe schemas and utilities shared between the client
and server applications. Uses Effect Schema for runtime validation and type
generation.

## Features

- **Effect Schema Integration** - Runtime validation with compile-time types
- **Shared Types** - Common interfaces used across apps
- **Type Safety** - End-to-end type safety from client to server
- **Functional Programming** - Built with Effect ecosystem patterns

## Usage

Import schemas in your apps:

```typescript
import { ApiResponse } from "@repo/domain/Api";
import { Schema } from "effect";

const response: typeof ApiResponse.Type = {
  message: "Hello bEvr!",
  success: true,
};
const valid = Schema.decodeUnknownSync(ApiResponse)(response);
```

## Structure

```txt
src/
├── Api.ts       # HttpApi definitions (REST endpoints)
├── Chat.ts      # Chat schemas and events
├── Rpc.ts       # RPC definitions (HTTP streaming)
└── WebSocket.ts # WebSocket RPC definitions (real-time)
```

## Learn More

- [Effect 4 Schema source](https://github.com/Effect-TS/effect/blob/main/packages/effect/src/Schema.ts)
- [bEvr Stack Overview](../../README.md)
