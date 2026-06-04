# Interview Prep AI

Prepare for any interview in minutes. Paste a job description, optionally add interviewer context, and get AI-generated questions tailored to the role. Practice your answers with voice recording, then receive structured evaluation against role-specific criteria.

## Features

- **Smart Question Generation** — Paste a job description (or URL) and get targeted interview questions powered by GPT-4o
- **Interviewer Lookup** — Add the interviewer's name and LinkedIn to get context-aware questions
- **Voice Practice** — Record answers directly in the browser with real-time transcription via Whisper
- **AI Evaluation** — Get scored feedback on each answer with specific, actionable suggestions
- **Session History** — Track your practice sessions and review past performance

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
git clone https://github.com/shiki4709/interview-prep-ai.git
cd interview-prep-ai
pnpm install
```

Create a `.env.local` file in the project root:

```
OPENAI_API_KEY=your-api-key-here
```

Initialize the database and start the dev server:

```bash
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [SQLite](https://www.sqlite.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- [OpenAI API](https://platform.openai.com/) (GPT-4o + Whisper)

## How It Works

1. **Create an interview** — Paste a job description or URL, add company name and role
2. **Generate questions** — AI analyzes the JD and produces tailored behavioral + technical questions
3. **Practice** — Pick a question, record your answer, review the transcription
4. **Evaluate** — AI scores your response on relevance, structure, and depth

## License

MIT
