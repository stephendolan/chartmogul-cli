# ChartMogul CLI

[![npm version](https://badge.fury.io/js/%40stephendolan%2Fchartmogul-cli.svg)](https://www.npmjs.com/package/@stephendolan/chartmogul-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A command-line interface for ChartMogul analytics, designed for developers and LLMs.

## Features

- **LLM-first design** - JSON output for easy parsing and automation
- **Analytics focused** - MRR, ARR, churn rates, LTV, customer counts
- **Secure auth** - Credentials stored in OS keychain
- **Read-only** - Query your data safely without risk of modification

## Installation

```bash
npm install -g @stephendolan/chartmogul-cli
```

On Linux, install libsecret for keychain support: `sudo apt-get install libsecret-1-dev`

## Authentication

```bash
chartmogul auth login --api-key YOUR_API_KEY
chartmogul auth status
chartmogul auth logout
```

Or use the environment variable: `export CHARTMOGUL_API_KEY=your_api_key`

Get your API key from ChartMogul: Profile -> API Keys

## Commands

### Metrics

All metric commands support `--start-date`, `--end-date`, and `--interval` (day, week, month, quarter).

```bash
chartmogul metrics all                    # All key metrics (last 30 days)
chartmogul metrics mrr                    # Monthly Recurring Revenue
chartmogul metrics arr                    # Annual Recurring Revenue
chartmogul metrics arpa                   # Average Revenue Per Account
chartmogul metrics asp                    # Average Sale Price
chartmogul metrics customer-count         # Customer count over time
chartmogul metrics customer-churn         # Customer churn rate
chartmogul metrics mrr-churn              # MRR churn rate
chartmogul metrics ltv                    # Customer Lifetime Value

# With date range
chartmogul metrics mrr --start-date 2024-01-01 --end-date 2024-12-31 --interval month
```

### Customers

```bash
chartmogul customers list                      # List all customers
chartmogul customers list --status Active      # Filter by status
chartmogul customers view <uuid>               # View customer details
chartmogul customers search --email user@example.com
chartmogul customers activities <uuid>         # Customer activities
chartmogul customers subscriptions <uuid>      # Customer subscriptions
```

### Other Resources

```bash
# Account
chartmogul account view

# Plans
chartmogul plans list
chartmogul plans view <uuid>

# Invoices
chartmogul invoices list
chartmogul invoices list --customer <uuid>
chartmogul invoices view <uuid>

# Data Sources
chartmogul data-sources list
chartmogul data-sources view <uuid>
chartmogul data-sources set-default <uuid>

# Activities
chartmogul activities list
chartmogul activities list --type new_biz --start-date 2024-01-01
```

## Output

All commands output JSON. Use `--compact` or `-c` for single-line output:

```bash
chartmogul metrics mrr                    # Pretty-printed JSON
chartmogul -c metrics mrr                 # Compact JSON (single line)
```

Errors are also returned as JSON:

```json
{"error": {"name": "unauthorized", "detail": "Invalid API key", "statusCode": 401}}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CHARTMOGUL_API_KEY` | API key (alternative to keychain) |
| `CHARTMOGUL_DATA_SOURCE` | Default data source UUID |

## License

MIT
