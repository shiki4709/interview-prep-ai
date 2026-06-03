import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return Response.json(
        { success: false, error: "URL is required" },
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

    // Step 1: Web search to get the person's info
    const searchResponse = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search_preview" }],
      input: `Look up this person's professional profile and give me a summary of who they are, their current role, company, career background, and areas of expertise: ${url}`,
    });

    const searchText = searchResponse.output_text ?? "";

    if (!searchText) {
      return Response.json(
        { success: false, error: "No results from search" },
        { status: 500 }
      );
    }

    // Step 2: Structured extraction via chat completions
    const extraction = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Extract the person's profile from the text below. Return a JSON object with:
- "name": the person's full name
- "background": a concise summary of their current title, company, key career highlights, and areas of expertise (2-4 sentences)`,
        },
        { role: "user", content: searchText },
      ],
    });

    const content = extraction.choices[0]?.message?.content;
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
      error instanceof Error ? error.message : "Failed to look up person";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
