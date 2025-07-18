# @repo/domain

Shared types and schemas for the [bhEvr stack](../../README.md), built with
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

Import types and schemas in your apps:

```typescript
// In client or server
import { ApiResponse, UserSchema } from "@repo/domain";

// Use types for API communication
const response: ApiResponse = await fetchData();

// Use schemas for validation
const validUser = UserSchema.decode(userData);
```

## Structure

```txt
src/
├── index.ts          # Main exports
├── schemas/          # Effect Schema definitions
├── types/            # TypeScript type definitions
└── utils/            # Shared utility functions
```

## Learn More

- [Effect Schema Documentation](https://effect.website/docs/schema)
- [bhEvr Stack Overview](../../README.md)
