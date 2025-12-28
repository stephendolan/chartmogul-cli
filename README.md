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

### From npm (recommended)

```bash
npm install -g @stephendolan/chartmogul-cli
# or
bun install -g @stephendolan/chartmogul-cli
```

### From source

```bash
git clone https://github.com/stephendolan/chartmogul-cli.git
cd chartmogul-cli
bun install
bun run link
```

### Linux prerequisites

On Linux, install libsecret for keychain support:

```bash
sudo apt-get install libsecret-1-dev
```

## Authentication

### Using API Key (recommended)

```bash
# Store API key in OS keychain
chartmogul auth login --api-key YOUR_API_KEY

# Check authentication status
chartmogul auth status

# Remove stored credentials
chartmogul auth logout
```

### Using environment variable

```bash
export CHARTMOGUL_API_KEY=your_api_key
```

Get your API key from ChartMogul: Profile → API Keys

## Usage

### Account

```bash
# View account details
chartmogul account view
```

### Metrics

```bash
# Get all metrics (last 30 days by default)
chartmogul metrics all

# MRR (Monthly Recurring Revenue)
chartmogul metrics mrr
chartmogul metrics mrr --start-date 2024-01-01 --end-date 2024-12-31

# ARR (Annual Recurring Revenue)
chartmogul metrics arr --interval month

# ARPA (Average Revenue Per Account)
chartmogul metrics arpa

# ASP (Average Sale Price)
chartmogul metrics asp

# Customer count
chartmogul metrics customer-count

# Customer churn rate
chartmogul metrics customer-churn

# MRR churn rate
chartmogul metrics mrr-churn

# LTV (Customer Lifetime Value)
chartmogul metrics ltv
```

### Customers

```bash
# List customers
chartmogul customers list
chartmogul customers list --status Active
chartmogul customers list --data-source <uuid>

# View a customer
chartmogul customers view <uuid>

# Search by email
chartmogul customers search --email user@example.com

# View customer activities
chartmogul customers activities <uuid>

# View customer subscriptions
chartmogul customers subscriptions <uuid>
```

### Plans

```bash
# List plans
chartmogul plans list

# View a plan
chartmogul plans view <uuid>
```

### Invoices

```bash
# List invoices
chartmogul invoices list
chartmogul invoices list --customer <uuid>

# View an invoice
chartmogul invoices view <uuid>
```

### Data Sources

```bash
# List data sources
chartmogul data-sources list

# View a data source
chartmogul data-sources view <uuid>

# Set default data source for filtering
chartmogul data-sources set-default <uuid>
```

### Activities

```bash
# List activities
chartmogul activities list
chartmogul activities list --type new_biz
chartmogul activities list --start-date 2024-01-01 --end-date 2024-12-31
```

## Output Formatting

All commands output JSON by default:

```bash
# Pretty-printed JSON (default)
chartmogul metrics mrr

# Compact JSON (single line)
chartmogul -c metrics mrr
chartmogul --compact customers list
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CHARTMOGUL_API_KEY` | API key (alternative to keychain) |
| `CHARTMOGUL_DATA_SOURCE` | Default data source UUID |

## Common Patterns

### Get current MRR

```bash
chartmogul metrics mrr --start-date $(date +%Y-%m-%d) --end-date $(date +%Y-%m-%d)
```

### Get monthly MRR trend

```bash
chartmogul metrics mrr --start-date 2024-01-01 --end-date 2024-12-31 --interval month
```

### Find high-value customers

```bash
chartmogul customers list | jq '.entries | sort_by(.mrr) | reverse | .[0:10]'
```

### Get churn analysis

```bash
chartmogul metrics customer-churn --start-date 2024-01-01 --end-date 2024-12-31 --interval month
```

### View recent activities

```bash
chartmogul activities list --type churn --start-date 2024-12-01
```

## Error Handling

Errors are returned as JSON:

```json
{
  "error": {
    "name": "unauthorized",
    "detail": "Invalid API key",
    "statusCode": 401
  }
}
```

## License

MIT
