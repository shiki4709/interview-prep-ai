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
          content: `Extract the job posting details from this text (likely copied from a job board page). Return a JSON object with:
- "companyName": the company name
- "roleName": the role/job title
- "jobDescription": the full job description including responsibilities, requirements, qualifications, and any other relevant details

If you cannot determine the company name or role name, use an empty string.`,
        },
        { role: "user", content: text.slice(0, 15000) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { success: false, error: "Failed to extract job details" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content) as {
      companyName: string;
      roleName: string;
      jobDescription: string;
    };
    return Response.json({ success: true, data: parsed });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to parse job description";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
