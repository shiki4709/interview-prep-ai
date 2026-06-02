"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

const VERDICT_STYLES: Record<string, string> = {
  Outstanding: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Solid: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Borderline: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Poor: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function EvaluationResult({
  evaluation,
  transcription,
}: EvaluationResultProps) {
  const [showRewrite, setShowRewrite] = useState(false);

  const verdictStyle =
    VERDICT_STYLES[evaluation.overallVerdict] ?? "bg-muted text-muted-foreground";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={`text-sm px-3 py-1 ${verdictStyle}`}>
          {evaluation.overallVerdict}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {evaluation.overallFeedback}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-400">
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {evaluation.strengths.map((s, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-emerald-400 mt-0.5 shrink-0">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-400">
              Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {evaluation.improvements.map((imp, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-amber-400 mt-0.5 shrink-0">-</span>
                  {imp}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Your Transcription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {transcription}
          </p>
        </CardContent>
      </Card>

      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRewrite((prev) => !prev)}
        >
          {showRewrite ? "Hide" : "Show"} Suggested Rewrite
        </Button>
        {showRewrite && (
          <Card className="mt-3">
            <CardContent className="py-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {evaluation.rewriteSuggestion}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
