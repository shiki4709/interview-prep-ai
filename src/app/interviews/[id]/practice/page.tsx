"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PracticeSession } from "@/components/PracticeSession";

const CATEGORY_TAG: Record<string, string> = {
  behavioral: "tag-blue",
  technical: "tag-green",
  situational: "tag-amber",
  "role-specific": "tag-purple",
};

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
      <p style={{ fontSize: 14, color: "var(--text-3)" }} className="animate-pulse">
        Loading...
      </p>
    );
  }

  if (!interview) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <p style={{ color: "var(--text-2)", marginBottom: 16 }}>Interview not found.</p>
        <Link href="/" className="btn-design btn-design-ghost">
          Back to Home
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
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <p style={{ color: "var(--text-2)", marginBottom: 16 }}>Question not found.</p>
        <Link href={`/interviews/${interviewId}`} className="btn-design btn-design-ghost">
          Back to Questions
        </Link>
      </div>
    );
  }

  const catTag = CATEGORY_TAG[question.category.toLowerCase()] ?? "";

  return (
    <div>
      <Link
        href={`/interviews/${interviewId}`}
        className="back-link"
      >
        <span>&larr;</span> {interview.companyName} &middot; {interview.roleName}
      </Link>

      {/* Category pill + question counter */}
      <div className="flex items-center" style={{ gap: 10, marginBottom: 18 }}>
        <span className={`tag ${catTag}`}>{question.category}</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: "var(--text-3)",
          }}
        >
          Question {questionIndex} of {interview.questions.length}
        </span>
      </div>

      <PracticeSession question={question} interviewId={interview.id} />
    </div>
  );
}
