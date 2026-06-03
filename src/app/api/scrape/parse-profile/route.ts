import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return Response.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Extract the person's professional profile from this text (likely copied from a LinkedIn page). Return a JSON object with:
- "name": the person's full name
- "background": a concise summary of their current title, company, key background, career highlights, and areas of expertise

If you cannot determine the name, use "Unknown". Focus on their current role and experience.`,
        },
        { role: "user", content: text.slice(0, 10000) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { success: false, error: "Failed to extract profile" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content) as {
      name: string;
      background: string;
    };
    return Response.json({ success: true, data: parsed });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to parse profile";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
