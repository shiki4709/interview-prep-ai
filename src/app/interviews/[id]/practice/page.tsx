"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PracticeSession } from "@/components/PracticeSession";

const CATEGORY_COLORS: Record<string, string> = {
  behavioral: "border-blue-300 text-blue-700 bg-blue-50",
  technical: "border-emerald-300 text-emerald-700 bg-emerald-50",
  situational: "border-amber-300 text-amber-700 bg-amber-50",
  "role-specific": "border-purple-300 text-purple-700 bg-purple-50",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] ?? "border-border text-muted-foreground";
}

interface Question {
  readonly id: number;
  readonly category: string;
  readonly question: string;
  readonly intent: string | null;
  readonly evaluationCriteria: string | null;
  readonly sortOrder: number;
}

interface Interview {
  readonly id: number;
  readonly companyName: string;
  readonly roleName: string;
  readonly questions: readonly Question[];
}

export default function PracticePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const interviewId = params.id as string;
  const questionId = searchParams.get("questionId");

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/interviews/${interviewId}`);
        const data = await res.json();
        if (data.success) {
          setInterview(data.data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [interviewId]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Interview not found.</p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const question = questionId
    ? interview.questions.find((q) => q.id === Number(questionId))
    : null;

  const questionIndex = question
    ? interview.questions.findIndex((q) => q.id === question.id) + 1
    : 0;

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Question not found.</p>
        <Link href={`/interviews/${interviewId}`}>
          <Button variant="outline">Back to Questions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link in uppercase mono */}
      <Link
        href={`/interviews/${interviewId}`}
        className="inline-block font-mono text-[11px] text-muted-foreground tracking-[0.2em] uppercase hover:text-foreground transition-colors"
      >
        &larr; {interview.companyName} &middot; {interview.roleName}
      </Link>

      {/* Category badge + question counter */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={getCategoryColor(question.category)}>
          {question.category}
        </Badge>
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
          Question {questionIndex} of {interview.questions.length}
        </span>
      </div>

      <PracticeSession
        question={question}
        interviewId={interview.id}
      />
    </div>
  );
}
