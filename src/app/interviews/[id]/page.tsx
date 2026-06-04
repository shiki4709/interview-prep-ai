"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

  const hasQuestions = interview.questions.length > 0;

  return (
    <div>
      <Link href="/" className="back-link">
        <span>&larr;</span> Interviews
      </Link>

      {/* Interview header */}
      <div style={{ marginBottom: 22 }}>
        <h1 className="display" style={{ fontSize: 40, lineHeight: 1 }}>
          {interview.companyName}
        </h1>
        <div className="flex items-center flex-wrap" style={{ gap: 12, marginTop: 12 }}>
          <span style={{ color: "var(--text-2)", fontSize: 15 }}>
            {interview.roleName}
          </span>
          {interview.interviewerName && (
            <span className="tag">
              <span
                className="dot"
                style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-3)" }}
              />
              {interview.interviewerName}
              {interview.interviewerBackground && (
                <span style={{ color: "var(--text-3)" }}>
                  &middot; {interview.interviewerBackground.split(".")[0]}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Stat line */}
      {hasQuestions && (
        <div className="stat-line">
          {interview.questions.length} QUESTION{interview.questions.length !== 1 ? "S" : ""}
        </div>
      )}

      {/* Generate button when no questions */}
      {!hasQuestions && (
        <div style={{ marginTop: 28 }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-design btn-design-primary"
            style={{ opacity: generating ? 0.5 : 1 }}
          >
            {generating ? "Generating..." : "Generate Questions"}
          </button>
          {!generating && (
            <p style={{ fontSize: 14, color: "var(--text-3)", marginTop: 12 }}>
              Click to create tailored interview questions based on the job description.
            </p>
          )}
        </div>
      )}

      {error && (
        <p style={{ fontSize: 14, color: "var(--destructive)", marginTop: 12 }}>{error}</p>
      )}

      {hasQuestions && (
        <QuestionList questions={interview.questions} interviewId={interview.id} />
      )}
    </div>
  );
}
