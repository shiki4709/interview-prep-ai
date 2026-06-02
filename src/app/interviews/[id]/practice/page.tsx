"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PracticeSession } from "@/components/PracticeSession";

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
      <div>
        <Link
          href={`/interviews/${interviewId}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; {interview.companyName} &mdash; {interview.roleName}
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Practice Session
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record your answer, then get AI feedback.
        </p>
      </div>

      <PracticeSession
        question={question}
        interviewId={interview.id}
      />
    </div>
  );
}
