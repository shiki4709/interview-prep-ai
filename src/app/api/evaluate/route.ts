import { db } from "@/db";
import { interviews, questions, sessions } from "@/db/schema";
import { evaluateAnswer } from "@/lib/evaluate";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, interviewId, transcription, duration } = body;

    if (!questionId || !interviewId || !transcription) {
      return Response.json(
        {
          success: false,
          error: "questionId, interviewId, and transcription are required",
        },
        { status: 400 }
      );
    }

    const interview = db
      .select()
      .from(interviews)
      .where(eq(interviews.id, interviewId))
      .get();

    if (!interview) {
      return Response.json(
        { success: false, error: "Interview not found" },
        { status: 404 }
      );
    }

    const question = db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .get();

    if (!question) {
      return Response.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const evaluation = await evaluateAnswer({
      question: question.question,
      transcription: String(transcription),
      duration: Number(duration) || 0,
      jobDescription: interview.jobDescription,
      roleName: interview.roleName,
      companyName: interview.companyName,
      intent: question.intent,
      evaluationCriteria: question.evaluationCriteria,
    });

    const session = db
      .insert(sessions)
      .values({
        questionId: Number(questionId),
        interviewId: Number(interviewId),
        transcription: String(transcription),
        duration: Number(duration) || 0,
        overallVerdict: evaluation.overallVerdict,
        feedback: JSON.stringify(evaluation),
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();

    return Response.json({
      success: true,
      data: { session, evaluation },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Evaluation failed";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
