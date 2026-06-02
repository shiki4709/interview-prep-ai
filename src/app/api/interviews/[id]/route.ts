import { db } from "@/db";
import { interviews, questions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const interviewId = parseInt(id, 10);

    if (isNaN(interviewId)) {
      return Response.json(
        { success: false, error: "Invalid interview ID" },
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

    const interviewQuestions = db
      .select()
      .from(questions)
      .where(eq(questions.interviewId, interviewId))
      .orderBy(questions.sortOrder)
      .all();

    return Response.json({
      success: true,
      data: { ...interview, questions: interviewQuestions },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch interview";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
