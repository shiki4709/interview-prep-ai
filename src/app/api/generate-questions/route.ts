import { db } from "@/db";
import { interviews, questions } from "@/db/schema";
import { generateQuestions } from "@/lib/generate";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interviewId } = body;

    if (!interviewId) {
      return Response.json(
        { success: false, error: "Interview ID is required" },
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

    const generated = await generateQuestions({
      jobDescription: interview.jobDescription,
      roleName: interview.roleName,
      companyName: interview.companyName,
      interviewerName: interview.interviewerName,
      interviewerBackground: interview.interviewerBackground,
    });

    const questionRows = generated.map((q, index) => ({
      interviewId: interview.id,
      category: q.category,
      question: q.question,
      intent: q.intent,
      evaluationCriteria: q.evaluationCriteria,
      sortOrder: index,
    }));

    for (const row of questionRows) {
      db.insert(questions).values(row).run();
    }

    db.update(interviews)
      .set({ generatedAt: new Date().toISOString() })
      .where(eq(interviews.id, interview.id))
      .run();

    const savedQuestions = db
      .select()
      .from(questions)
      .where(eq(questions.interviewId, interview.id))
      .orderBy(questions.sortOrder)
      .all();

    return Response.json({ success: true, data: savedQuestions });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate questions";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
