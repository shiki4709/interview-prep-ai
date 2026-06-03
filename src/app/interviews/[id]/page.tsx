"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QuestionList } from "@/components/QuestionList";

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
  readonly jobDescription: string;
  readonly interviewerName: string | null;
  readonly interviewerBackground: string | null;
  readonly generatedAt: string | null;
  readonly createdAt: string;
  readonly questions: readonly Question[];
}

export default function InterviewDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInterview = useCallback(async () => {
    try {
      const res = await fetch(`/api/interviews/${id}`);
      const data = await res.json();
      if (data.success) {
        setInterview(data.data);
      } else {
        setError(data.error || "Failed to load interview");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: Number(id) }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to generate questions");
        return;
      }

      await loadInterview();
    } catch {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

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

  const hasQuestions = interview.questions.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; All Interviews
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-heading tracking-tight">
          {interview.companyName}
        </h1>
        <p className="text-muted-foreground mt-1">{interview.roleName}</p>
        {interview.interviewerName && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Interviewer</span>
            <span className="text-sm font-medium">{interview.interviewerName}</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {interview.jobDescription}
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions</h2>
          {!hasQuestions && (
            <Button
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate Questions"}
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {hasQuestions ? (
          <QuestionList
            questions={interview.questions}
            interviewId={interview.id}
          />
        ) : (
          !generating && (
            <p className="text-sm text-muted-foreground">
              Click "Generate Questions" to create tailored interview questions
              based on the job description.
            </p>
          )
        )}
      </div>
    </div>
  );
}
