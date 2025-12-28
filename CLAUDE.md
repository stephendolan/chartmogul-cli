# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChartMogul CLI is a command-line interface for ChartMogul analytics, designed for LLMs and developers to interface with revenue metrics. The CLI outputs JSON by default and is read-only (no data modification).

## Development Commands

### Running and Building
```bash
bun run dev          # Run CLI in development mode (no build required)
bun run build        # Build for production using tsup
bun run link         # Build and link globally (makes `chartmogul` available system-wide)
bun run start        # Run built CLI from dist/

# Testing the CLI locally
bun run src/cli.ts <command>     # Run directly without building
bun dist/cli.js <command>        # Run after building
```

### Quality Checks
```bash
bun run typecheck    # Type check without emitting files
bun run lint         # Lint TypeScript files in src/
bun test             # Run vitest tests
```

## Architecture

### Core Structure

The CLI follows a command-based architecture built on Commander.js:

- **src/cli.ts**: Entry point that registers all commands and handles global flags (`--compact`)
- **src/commands/**: Each file exports a `create*Command()` function that returns a Commander Command
  - Commands: auth, account, metrics, customers, plans, invoices, data-sources, activities
- **src/lib/**: Shared utilities and core functionality
  - **api-client.ts**: Main ChartMogul API wrapper (`ChartMogulClient` class) - single source of truth for API calls
  - **auth.ts**: OS keychain integration via @napi-rs/keyring for secure API key storage
  - **config.ts**: Application config management via `conf` package
  - **output.ts**: JSON output formatting
  - **errors.ts**: Centralized error handling for ChartMogul API errors
  - **command-utils.ts**: Shared command helpers (`withErrorHandling`)
  - **dates.ts**: Date parsing and validation utilities
  - **utils.ts**: Currency conversion (cents to dollars)
- **src/types/**: TypeScript type definitions

### Authentication Flow

ChartMogul uses Basic Auth with API key:

1. User provides API key via `chartmogul auth login --api-key YOUR_KEY`
2. API key stored in OS keychain via @napi-rs/keyring
3. Requests use Basic Auth: `Authorization: Basic base64(api_key:)`
4. Environment variable fallback: `CHARTMOGUL_API_KEY`

### Output System

All commands use `outputJson()` from src/lib/output.ts which:
1. Converts monetary values from cents to dollars (MRR, ARR, amounts, etc.)
2. Formats as JSON (pretty or compact based on `--compact` flag)
3. Writes to stdout

### Error Handling

All API calls go through `ChartMogulClient.request()` which throws structured errors. Commands use `withErrorHandling()` wrapper. Errors are output as JSON:
```json
{
  "error": {
    "name": "error_name",
    "detail": "Error detail",
    "statusCode": 400
  }
}
```

## Adding New Commands

1. Create or modify file in src/commands/
2. Export a `create*Command()` function that returns a Commander Command
3. Register in src/cli.ts
4. Use `client` from src/lib/api-client.ts for API calls
5. Use `outputJson()` for JSON output
6. Wrap action handlers with `withErrorHandling()`

## API Reference

Base URL: `https://api.chartmogul.com/v1`

### Rate Limits
- Returns 429 when exceeded with `Retry-After` header

### Key Endpoints Used
- `/account` - Account details
- `/metrics/*` - MRR, ARR, churn, LTV, customer count
- `/customers` - List, view, search customers
- `/plans` - List and view plans
- `/invoices` - List and view invoices
- `/data_sources` - List and view data sources
- `/activities` - List activities

## Build Configuration

- **tsup.config.ts**: Bundles src/cli.ts → dist/cli.js as ESM
- **package.json**: Type is "module" (ESM), main is dist/cli.js, bin is "chartmogul"
- Shebang `#!/usr/bin/env bun` in src/cli.ts makes dist/cli.js directly executable
