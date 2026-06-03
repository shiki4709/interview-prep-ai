"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EvaluationResult } from "./EvaluationResult";

interface PracticeSessionProps {
  readonly question: {
    readonly id: number;
    readonly question: string;
    readonly category: string;
    readonly intent: string | null;
  };
  readonly interviewId: number;
}

type SessionState = "idle" | "recording" | "transcribing" | "reviewing" | "evaluating" | "done" | "error";

interface Evaluation {
  readonly overallVerdict: string;
  readonly strengths: readonly string[];
  readonly improvements: readonly string[];
  readonly overallFeedback: string;
  readonly rewriteSuggestion: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getTimerColor(seconds: number): string {
  if (seconds >= 210) return "text-red-400";
  if (seconds >= 150) return "text-amber-400";
  return "text-foreground";
}

export function PracticeSession({
  question,
  interviewId,
}: PracticeSessionProps) {
  const [state, setState] = useState<SessionState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopTimer]);

  async function startRecording() {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        stopTimer();

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processRecording(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);

      setElapsed(0);
      setState("recording");

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch {
      setError(
        "Microphone access denied. Please allow microphone access and try again."
      );
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  async function processRecording(blob: Blob) {
    setState("transcribing");

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeData = await transcribeRes.json();

      if (!transcribeData.success) {
        throw new Error(transcribeData.error || "Transcription failed");
      }

      const transcribedText = transcribeData.data.text;
      setTranscription(transcribedText);
      setState("reviewing");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  }

  async function submitForEvaluation() {
    setState("evaluating");
    setError(null);

    try {
      const evaluateRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          interviewId,
          transcription,
          duration: elapsed,
        }),
      });

      const evaluateData = await evaluateRes.json();

      if (!evaluateData.success) {
        throw new Error(evaluateData.error || "Evaluation failed");
      }

      setEvaluation(evaluateData.data.evaluation);
      setState("done");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Evaluation failed";
      setError(message);
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setElapsed(0);
    setTranscription("");
    setEvaluation(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {/* Question text */}
      <h2 className="font-heading text-[1.5rem] leading-relaxed tracking-tight">
        {question.question}
      </h2>

      {/* Intent / Testing */}
      {question.intent && (
        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Testing:</span>{" "}
          {question.intent}
        </p>
      )}

      {/* Recording section inside a card */}
      <Card>
        <CardContent className="py-6 space-y-5">
          <p className="text-sm font-medium border-b border-border pb-2">
            Recording
          </p>

          <div className="flex flex-col items-center gap-4">
            {state === "idle" && (
              <>
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
                  aria-label="Start recording"
                >
                  <div className="w-5 h-5 rounded-full bg-white" />
                </button>
                <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                  Ready to record
                </span>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Tap to start. Aim for two to three minutes &mdash; like the real thing.
                </p>
                <div className="flex flex-col items-center gap-1">
                  <span className={`font-mono text-2xl tabular-nums ${getTimerColor(elapsed)}`}>
                    {formatTime(elapsed)}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
                    AMBER 2:30 &middot; RED 3:30
                  </span>
                </div>
              </>
            )}

            {state === "recording" && (
              <>
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
                  aria-label="Stop recording"
                >
                  <div className="w-5 h-5 rounded-sm bg-white" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                    Recording
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={`font-mono text-2xl tabular-nums ${getTimerColor(elapsed)}`}>
                    {formatTime(elapsed)}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
                    AMBER 2:30 &middot; RED 3:30
                  </span>
                </div>
              </>
            )}

            {state === "transcribing" && (
              <p className="text-sm text-muted-foreground animate-pulse py-4">
                Transcribing your answer...
              </p>
            )}

            {state === "reviewing" && (
              <div className="flex gap-2">
                <Button onClick={submitForEvaluation} size="lg">
                  Evaluate
                </Button>
                <Button onClick={reset} variant="outline" size="lg">
                  Re-record
                </Button>
              </div>
            )}

            {state === "evaluating" && (
              <p className="text-sm text-muted-foreground animate-pulse py-4">
                Evaluating your answer...
              </p>
            )}

            {(state === "done" || state === "error") && (
              <Button onClick={reset} variant="outline">
                Try Again
              </Button>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}
        </CardContent>
      </Card>

      {state === "reviewing" && (
        <Card>
          <CardContent className="py-4 space-y-3">
            <p className="text-sm font-medium">Review Transcription</p>
            <p className="text-xs text-muted-foreground">
              Fix any transcription errors before evaluating.
            </p>
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={8}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </CardContent>
        </Card>
      )}

      {state === "done" && evaluation && (
        <EvaluationResult
          evaluation={evaluation}
          transcription={transcription}
        />
      )}
    </div>
  );
}
