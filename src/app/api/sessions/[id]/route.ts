import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = Number(id);

    if (Number.isNaN(sessionId)) {
      return Response.json(
        { success: false, error: "Invalid session ID" },
        { status: 400 }
      );
    }

    const existing = db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .get();

    if (!existing) {
      return Response.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    db.delete(sessions).where(eq(sessions.id, sessionId)).run();

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete session";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
