"use client";

import Link from "next/link";

interface Question {
  readonly id: number;
  readonly category: string;
  readonly question: string;
  readonly intent: string | null;
  readonly sortOrder: number;
}

interface QuestionListProps {
  readonly questions: readonly Question[];
  readonly interviewId: number;
}

const CATEGORY_TAG: Record<string, string> = {
  behavioral: "tag-blue",
  technical: "tag-green",
  situational: "tag-amber",
  "role-specific": "tag-purple",
};

function getCategoryTag(category: string): string {
  return CATEGORY_TAG[category.toLowerCase()] ?? "";
}

function groupByCategory(
  items: readonly Question[]
): Record<string, readonly Question[]> {
  const groups: Record<string, Question[]> = {};
  for (const q of items) {
    const cat = q.category.toLowerCase();
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(q);
  }
  return groups;
}

export function QuestionList({ questions, interviewId }: QuestionListProps) {
  const grouped = groupByCategory(questions);
  const categories = Object.keys(grouped);

  if (categories.length === 0) {
    return (
      <p style={{ color: "var(--text-3)", textAlign: "center", padding: "32px 0" }}>
        No questions generated yet.
      </p>
    );
  }

  return (
    <div>
      {categories.map((category) => (
        <div key={category} style={{ marginTop: 28 }}>
          {/* Category header */}
          <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
            <span className={`tag ${getCategoryTag(category)}`}>
              {category}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                color: "var(--text-3)",
              }}
            >
              {grouped[category].length} question{grouped[category].length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Question cards */}
          {grouped[category].map((q) => (
            <div
              key={q.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 18,
                alignItems: "center",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "17px 19px",
                marginBottom: 10,
                transition: "border-color 0.12s, box-shadow 0.12s",
              }}
              className="qcard-hover"
            >
              <div>
                <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--foreground)", maxWidth: "60ch" }}>
                  {q.question}
                </p>
                {q.intent && (
                  <p style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 8 }}>
                    <b style={{ color: "var(--text-2)", fontWeight: 600 }}>Testing:</b> {q.intent}
                  </p>
                )}
              </div>
              <Link
                href={`/interviews/${interviewId}/practice?questionId=${q.id}`}
                className="btn-design btn-design-ghost"
              >
                &#9654; Practice
              </Link>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
