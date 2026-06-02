import OpenAI from "openai";

interface GenerateQuestionsInput {
  readonly jobDescription: string;
  readonly roleName: string;
  readonly companyName: string;
  readonly interviewerName?: string | null;
  readonly interviewerBackground?: string | null;
}

interface GeneratedQuestion {
  readonly category: string;
  readonly question: string;
  readonly intent: string;
  readonly evaluationCriteria: string;
}

export async function generateQuestions(
  input: GenerateQuestionsInput
): Promise<readonly GeneratedQuestion[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });

  const interviewerContext = input.interviewerName
    ? `\nInterviewer: ${input.interviewerName}${input.interviewerBackground ? `\nInterviewer Background: ${input.interviewerBackground}` : ""}`
    : "";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert interview coach. Generate 8-12 targeted interview questions based on the job description and context provided. Return a JSON object with a "questions" array.

Each question must have:
- "category": one of "behavioral", "technical", "situational", or "role-specific"
- "question": the interview question text
- "intent": what the interviewer is really testing with this question (1-2 sentences)
- "evaluationCriteria": what a strong answer looks like (2-3 sentences)

Mix categories based on the role. Technical roles should lean more technical. Leadership roles should lean more behavioral and situational. Always include at least 2 behavioral questions.`,
      },
      {
        role: "user",
        content: `Company: ${input.companyName}
Role: ${input.roleName}
Job Description: ${input.jobDescription}${interviewerContext}

Generate targeted interview questions for this role.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content) as { questions: GeneratedQuestion[] };
  return parsed.questions;
}
