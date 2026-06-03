"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

const CATEGORY_COLORS: Record<string, string> = {
  behavioral: "border-blue-300 text-blue-700 bg-blue-50",
  technical: "border-emerald-300 text-emerald-700 bg-emerald-50",
  situational: "border-amber-300 text-amber-700 bg-amber-50",
  "role-specific": "border-purple-300 text-purple-700 bg-purple-50",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] ?? "bg-muted text-muted-foreground";
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
      <p className="text-muted-foreground text-center py-8">
        No questions generated yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={getCategoryColor(category)}>
              {category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {grouped[category].length} question
              {grouped[category].length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {grouped[category].map((q) => (
              <Card key={q.id} className="bg-card/50">
                <CardContent className="py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed">
                      {q.question}
                    </p>
                    {q.intent && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Intent: {q.intent}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/interviews/${interviewId}/practice?questionId=${q.id}`}
                  >
                    <Button variant="outline" size="sm">
                      Practice
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator className="mt-6" />
        </div>
      ))}
    </div>
  );
}
