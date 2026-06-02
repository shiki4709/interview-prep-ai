# Interview Prep AI

AI-powered interview practice tool. Paste a job description, get tailored questions, record your answers, and receive AI evaluation.

## Setup

```bash
pnpm install
```

Copy `.env.local` and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-...
```

Initialize the database:

```bash
pnpm db:migrate
```

Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- SQLite (better-sqlite3) + Drizzle ORM
- OpenAI (GPT-4o + Whisper)
