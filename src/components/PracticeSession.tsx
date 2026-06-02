"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type SessionState = "idle" | "recording" | "transcribing" | "evaluating" | "done" | "error";

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

      setState("evaluating");

      const evaluateRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          interviewId,
          transcription: transcribedText,
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
        err instanceof Error ? err.message : "Something went wrong";
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {question.question}
          </CardTitle>
          {question.intent && (
            <p className="text-sm text-muted-foreground mt-1">
              Intent: {question.intent}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {state === "idle" && (
              <Button onClick={startRecording} size="lg">
                Start Recording
              </Button>
            )}

            {state === "recording" && (
              <>
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                >
                  Stop Recording
                </Button>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span
                    className={`font-mono text-lg tabular-nums ${getTimerColor(elapsed)}`}
                  >
                    {formatTime(elapsed)}
                  </span>
                </div>
              </>
            )}

            {state === "transcribing" && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Transcribing your answer...
              </p>
            )}

            {state === "evaluating" && (
              <p className="text-sm text-muted-foreground animate-pulse">
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

      {state === "done" && evaluation && (
        <EvaluationResult
          evaluation={evaluation}
          transcription={transcription}
        />
      )}
    </div>
  );
}
