# Contxt Landing Page

Landing page for [contxt.to](https://contxt.to) — a context-sharing short link platform.

## Structure

```
├── index.html        # Landing page
├── api/
│   └── waitlist.js   # Airtable waitlist endpoint
├── vercel.json       # Vercel config
└── README.md
```

## Development

Deployed via Vercel. Push to main → auto-deploys.

## Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `AIRTABLE_TOKEN` | Airtable personal access token |
| `AIRTABLE_BASE_ID` | Airtable base ID for waitlist |
