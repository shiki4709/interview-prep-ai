import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { url, type } = await request.json();

    if (!url || typeof url !== "string") {
      return Response.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // LinkedIn blocks server-side fetching
    if (/linkedin\.com/i.test(url)) {
      return Response.json(
        { success: false, error: "LINKEDIN_BLOCKED" },
        { status: 422 }
      );
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return Response.json(
        { success: false, error: `Failed to fetch URL (${res.status})` },
        { status: 400 }
      );
    }

    const html = await res.text();

    // Extract meta description first (SPAs like Ashby put the full JD here)
    const metaMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i
    );
    const metaDescription = metaMatch?.[1]
      ?.replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();

    const hasRichMeta = !!metaDescription && metaDescription.length > 200;

    // Detect JS-required pages (skip if meta description has the content)
    if (
      !hasRichMeta &&
      (html.includes("You need to enable JavaScript") ||
        (html.includes("noscript") && html.length < 5000))
    ) {
      return Response.json(
        { success: false, error: "JS_REQUIRED" },
        { status: 422 }
      );
    }

    // Strip HTML tags and extract body text
    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#\d+;/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Prefer meta description if substantial (SPA job boards)
    const textContent = hasRichMeta
      ? metaDescription
      : bodyText.slice(0, 15000);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    if (type === "interviewer") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Extract the person's professional profile from this webpage text. Return a JSON object with:
- "name": the person's full name
- "background": a concise summary of their current title, company, key background, career highlights, and areas of expertise

If you cannot determine the name, use "Unknown". Focus on their current role and experience.`,
          },
          { role: "user", content: textContent },
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
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Extract the job posting details from this webpage text. Return a JSON object with:
- "companyName": the company name
- "roleName": the role/job title
- "jobDescription": the full job description including responsibilities, requirements, qualifications, and any other relevant details

If you cannot determine the company name or role name, use an empty string.`,
        },
        { role: "user", content: textContent },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { success: false, error: "Failed to extract content" },
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
      error instanceof Error ? error.message : "Failed to scrape URL";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
