import OpenAI from "openai";

interface EvaluateInput {
  readonly question: string;
  readonly transcription: string;
  readonly duration: number;
  readonly jobDescription: string;
  readonly roleName: string;
  readonly companyName: string;
  readonly intent?: string | null;
  readonly evaluationCriteria?: string | null;
}

interface EvaluationResult {
  readonly overallVerdict: "Poor" | "Borderline" | "Solid" | "Outstanding";
  readonly strengths: readonly string[];
  readonly improvements: readonly string[];
  readonly overallFeedback: string;
  readonly rewriteSuggestion: string;
}

export async function evaluateAnswer(
  input: EvaluateInput
): Promise<EvaluationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });

  const durationMinutes = Math.floor(input.duration / 60);
  const durationSeconds = input.duration % 60;
  const durationStr = `${durationMinutes}m ${durationSeconds}s`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert interview coach evaluating a candidate's answer. Assess the answer based on the role context, question intent, and evaluation criteria.

Return a JSON object with:
- "overallVerdict": exactly one of "Poor", "Borderline", "Solid", or "Outstanding"
- "strengths": array of 2-4 specific things the candidate did well
- "improvements": array of 2-4 specific, actionable improvements
- "overallFeedback": 2-3 sentences of holistic feedback
- "rewriteSuggestion": a rewritten, stronger version of the candidate's answer (keep it natural and conversational, not robotic)

Consider:
- Relevance to the question and role
- Use of specific examples and metrics (STAR method)
- Conciseness (ideal: 1.5-2.5 minutes for behavioral, shorter for technical)
- Clarity and structure
- Answer duration was ${durationStr}`,
      },
      {
        role: "user",
        content: `Company: ${input.companyName}
Role: ${input.roleName}
Job Description: ${input.jobDescription}
${input.intent ? `Question Intent: ${input.intent}` : ""}
${input.evaluationCriteria ? `Evaluation Criteria: ${input.evaluationCriteria}` : ""}

Question: ${input.question}

Candidate's Answer (transcribed):
${input.transcription}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as EvaluationResult;
}
