"use client";

import { useState } from "react";

interface Evaluation {
  readonly overallVerdict: string;
  readonly strengths: readonly string[];
  readonly improvements: readonly string[];
  readonly overallFeedback: string;
  readonly rewriteSuggestion: string;
}

interface EvaluationResultProps {
  readonly evaluation: Evaluation;
  readonly transcription: string;
}

const VERDICT_TAG: Record<string, string> = {
  Outstanding: "tag-green",
  Solid: "tag-blue",
  Borderline: "tag-amber",
  Poor: "tag-red",
};

const VERDICT_ORDER = ["Poor", "Borderline", "Solid", "Outstanding"];

export function EvaluationResult({ evaluation, transcription }: EvaluationResultProps) {
  const [showRewrite, setShowRewrite] = useState(true);

  const verdictTag = VERDICT_TAG[evaluation.overallVerdict] ?? "";
  const verdictIndex = VERDICT_ORDER.indexOf(evaluation.overallVerdict);

  return (
    <div>
      {/* Eyebrow */}
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        Evaluation
      </div>

      {/* Verdict ladder */}
      <div className="ladder">
        {VERDICT_ORDER.map((v, i) => (
          <div key={v} className={`step ${i <= verdictIndex ? "on" : ""}`}>
            <div className="bar" />
            <span>{v}</span>
          </div>
        ))}
      </div>

      {/* Verdict pill */}
      <div
        className={`tag ${verdictTag}`}
        style={{ padding: "6px 14px", fontSize: 16, fontWeight: 600, marginBottom: 22 }}
      >
        {evaluation.overallVerdict}
      </div>

      {/* Overall feedback */}
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.65,
          color: "var(--text-2)",
          maxWidth: "64ch",
        }}
      >
        {evaluation.overallFeedback}
      </p>

      {/* Transcript block */}
      <div
        style={{
          marginTop: 22,
          background: "var(--accent)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "20px 22px",
        }}
      >
        <span className="slabel">Your answer &middot; transcript</span>
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.7,
            color: "var(--text-2)",
            marginTop: 12,
          }}
        >
          {transcription}
        </p>
      </div>

      {/* Feedback grid */}
      <div className="fb-grid" style={{ marginTop: 24 }}>
        {/* Strengths */}
        <div className="panel" style={{ padding: "18px 20px 20px" }}>
          <h3
            className="flex items-center"
            style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, gap: 8 }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--t-green-fg)",
              }}
            />
            Strengths
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
            {(evaluation.strengths ?? []).map((s, i) => (
              <li
                key={i}
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "var(--text-2)",
                  display: "grid",
                  gridTemplateColumns: "15px 1fr",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                    color: "var(--t-green-fg)",
                  }}
                >
                  +
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="panel" style={{ padding: "18px 20px 20px" }}>
          <h3
            className="flex items-center"
            style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, gap: 8 }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--t-amber-fg)",
              }}
            />
            Improvements
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
            {(evaluation.improvements ?? []).map((imp, i) => (
              <li
                key={i}
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "var(--text-2)",
                  display: "grid",
                  gridTemplateColumns: "15px 1fr",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                    color: "var(--t-amber-fg)",
                  }}
                >
                  &rarr;
                </span>
                {imp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested rewrite */}
      <div
        style={{
          marginTop: 24,
          background: "var(--accent)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "22px 24px",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="slabel">Suggested stronger version</span>
          <button
            onClick={() => setShowRewrite((prev) => !prev)}
            className="btn-design btn-design-ghost"
            style={{ height: 32, padding: "0 12px", fontSize: 12.5 }}
          >
            {showRewrite ? "Hide" : "Show"}
          </button>
        </div>
        {showRewrite && (
          <p
            className="display"
            style={{
              fontSize: 19,
              lineHeight: 1.5,
              marginTop: 12,
            }}
          >
            <span style={{ color: "var(--text-3)" }}>&ldquo;</span>
            {evaluation.rewriteSuggestion}
            <span style={{ color: "var(--text-3)" }}>&rdquo;</span>
          </p>
        )}
      </div>
    </div>
  );
}
