# llm-monitor-fi

> Real-time observability platform for LLMs in production — built for Finnish enterprises.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Node.js-black)
![Status](https://img.shields.io/badge/status-active-brightgreen)

## The Problem

Every Finnish company integrating OpenAI, Azure AI, or similar APIs into their products is flying blind. There is no visibility into whether the AI is actually working correctly in production — no token tracking, no latency alerts, no hallucination detection.

I built this to solve that.

## What It Does

- **Token usage tracking** — monitor input/output token consumption per query, per user, per endpoint
- **Latency monitoring** — real-time response time graphs with p50/p95/p99 breakdowns
- **Cost dashboard** — running cost per API call with daily/weekly/monthly summaries
- **Hallucination flagging** — cosine similarity scoring against source documents to detect off-topic responses
- **Alert system** — Slack/email notifications when quality drops below threshold
- **Multi-model support** — OpenAI GPT-4, Azure OpenAI, Anthropic Claude, local Ollama models

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (metrics), Redis (real-time cache) |
| Logging | Custom middleware + LangSmith integration |
| Cloud | AWS / Azure compatible |
| Auth | NextAuth.js |

## Project Structure

```
llm-monitor-fi/
├── frontend/          # Next.js dashboard
│   ├── app/
│   ├── components/
│   └── lib/
├── backend/           # Node.js API server
│   ├── routes/
│   ├── middleware/
│   └── services/
├── docs/              # Architecture diagrams, API docs
└── docker-compose.yml
```

## Who This Is For

Finnish companies using LLMs in production — Solita, Futurice, Reaktor, Wolt, Smartly.io, Aiven, or any organization running OpenAI/Azure APIs internally.

## Getting Started

```bash
git clone https://github.com/mzulqarnain118/llm-monitor-fi
cd llm-monitor-fi
npm install
npm run dev
```

See [docs/setup.md](docs/setup.md) for full configuration.

## Roadmap

- [x] Repository setup and architecture design
- [ ] Token usage middleware
- [ ] Latency tracking service
- [ ] Cost calculation engine
- [ ] Hallucination detection module
- [ ] Dashboard UI (Next.js)
- [ ] Alert system (Slack/email)
- [ ] Docker deployment
- [ ] Demo hosted on Vercel

## License

MIT — see [LICENSE](LICENSE)
