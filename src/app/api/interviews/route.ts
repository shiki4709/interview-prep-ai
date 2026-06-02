import { db } from "@/db";
import { interviews } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = db
      .select({
        id: interviews.id,
        companyName: interviews.companyName,
        roleName: interviews.roleName,
        generatedAt: interviews.generatedAt,
        createdAt: interviews.createdAt,
        questionCount: sql<number>`(
          SELECT COUNT(*) FROM questions WHERE questions.interview_id = ${interviews.id}
        )`,
      })
      .from(interviews)
      .orderBy(desc(interviews.createdAt))
      .all();

    return Response.json({ success: true, data: rows });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch interviews";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { companyName, roleName, jobDescription, interviewerName, interviewerBackground } = body;

    if (!companyName || !roleName || !jobDescription) {
      return Response.json(
        { success: false, error: "Company name, role name, and job description are required" },
        { status: 400 }
      );
    }

    const result = db
      .insert(interviews)
      .values({
        companyName: String(companyName),
        roleName: String(roleName),
        jobDescription: String(jobDescription),
        interviewerName: interviewerName ? String(interviewerName) : null,
        interviewerBackground: interviewerBackground
          ? String(interviewerBackground)
          : null,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();

    return Response.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create interview";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
