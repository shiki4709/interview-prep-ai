import { db } from "@/db";
import { sessions, questions, interviews } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("interviewId");

    const rows = db
      .select({
        id: sessions.id,
        questionId: sessions.questionId,
        interviewId: sessions.interviewId,
        transcription: sessions.transcription,
        duration: sessions.duration,
        overallVerdict: sessions.overallVerdict,
        feedback: sessions.feedback,
        createdAt: sessions.createdAt,
        questionText: questions.question,
        category: questions.category,
        companyName: interviews.companyName,
        roleName: interviews.roleName,
      })
      .from(sessions)
      .innerJoin(questions, eq(sessions.questionId, questions.id))
      .innerJoin(interviews, eq(sessions.interviewId, interviews.id))
      .where(
        interviewId
          ? eq(sessions.interviewId, Number(interviewId))
          : undefined
      )
      .orderBy(desc(sessions.createdAt))
      .all();

    return Response.json({ success: true, data: rows });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch sessions";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
