"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

function getTimerState(seconds: number): "ok" | "warn" | "danger" {
  if (seconds >= 210) return "danger";
  if (seconds >= 150) return "warn";
  return "ok";
}

export function PracticeSession({ question, interviewId }: PracticeSessionProps) {
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
        if (e.data.size > 0) chunksRef.current.push(e.data);
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
      timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    } catch {
      setError("Microphone access denied. Please allow microphone access and try again.");
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
      const transcribeRes = await fetch("/api/transcribe", { method: "POST", body: formData });
      const transcribeData = await transcribeRes.json();
      if (!transcribeData.success) throw new Error(transcribeData.error || "Transcription failed");
      setTranscription(transcribeData.data.text);
      setState("reviewing");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  async function submitForEvaluation() {
    if (state !== "reviewing") return;
    setState("evaluating");
    setError(null);
    try {
      const evaluateRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, interviewId, transcription, duration: elapsed }),
      });
      const evaluateData = await evaluateRes.json();
      if (!evaluateData.success) throw new Error(evaluateData.error || "Evaluation failed");
      setEvaluation(evaluateData.data.evaluation);
      setState("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
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

  const isLive = state === "recording";
  const timerState = getTimerState(elapsed);

  return (
    <div>
      {/* Question panel */}
      <div className="panel panel-pad">
        <h2 className="display" style={{ fontSize: 30, lineHeight: 1.14, maxWidth: "24ch" }}>
          {question.question}
        </h2>

        {question.intent && (
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 12, maxWidth: "60ch" }}>
            <b style={{ color: "var(--text-2)", fontWeight: 600 }}>Testing:</b> {question.intent}
          </p>
        )}

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "22px 0" }} />

        {/* Recording section */}
        <div className="slabel" style={{ marginBottom: 18 }}>Recording</div>

        <div
          className="flex items-center"
          style={{ gap: 24 }}
        >
          {/* Record button */}
          {(state === "idle" || state === "recording") && (
            <button
              onClick={isLive ? stopRecording : startRecording}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                flexShrink: 0,
                border: `2px solid ${isLive ? "oklch(0.58 0.20 25)" : "var(--border-2)"}`,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
              aria-label={isLive ? "Stop recording" : "Start recording"}
            >
              <div
                style={{
                  width: isLive ? 18 : 21,
                  height: isLive ? 18 : 21,
                  borderRadius: isLive ? 4 : "50%",
                  background: "oklch(0.58 0.20 25)",
                  transition: "all 0.18s",
                }}
              />
            </button>
          )}

          {/* Status + hint */}
          {(state === "idle" || state === "recording") && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center" style={{ gap: 9 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isLive ? "oklch(0.58 0.20 25)" : "var(--text-3)",
                    animation: isLive ? "pulse 1.4s ease-in-out infinite" : "none",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase" as const,
                    color: isLive ? "var(--text-2)" : "var(--text-3)",
                  }}
                >
                  {isLive
                    ? "Recording"
                    : elapsed > 0
                      ? `Recorded \u00B7 ${formatTime(elapsed)}`
                      : "Ready to record"}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 7 }}>
                {isLive
                  ? "Click the button to stop"
                  : "Tap to start. Aim for two to three minutes."}
              </p>
            </div>
          )}

          {/* Waveform (recording only) */}
          {isLive && (
            <div className="flex items-center" style={{ gap: 3, height: 26 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <i
                  key={i}
                  style={{
                    width: 3,
                    height: 6,
                    borderRadius: 2,
                    background: "var(--signal-accent)",
                    animation: `bounce 0.9s ease-in-out infinite`,
                    animationDelay: `${(i - 1) * 0.12}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Timer */}
          {(state === "idle" || state === "recording") && (
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 38,
                  fontWeight: 500,
                  lineHeight: 1,
                  color:
                    timerState === "danger"
                      ? "oklch(0.58 0.20 25)"
                      : timerState === "warn"
                        ? "oklch(0.62 0.14 62)"
                        : "var(--foreground)",
                }}
              >
                {formatTime(elapsed)}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "var(--text-3)",
                  marginTop: 7,
                  textAlign: "right",
                }}
              >
                Amber 2:30 &middot; Red 3:30
              </div>
            </div>
          )}
        </div>

        {/* Transcribing state */}
        {state === "transcribing" && (
          <p style={{ fontSize: 14, color: "var(--text-3)", padding: "16px 0" }} className="animate-pulse">
            Transcribing your answer...
          </p>
        )}

        {/* Evaluating state */}
        {state === "evaluating" && (
          <p style={{ fontSize: 14, color: "var(--text-3)", padding: "16px 0" }} className="animate-pulse">
            Evaluating your answer...
          </p>
        )}

        {error && (
          <p style={{ fontSize: 14, color: "var(--destructive)", marginTop: 16 }}>{error}</p>
        )}
      </div>

      {/* Transcript review */}
      {state === "reviewing" && (
        <div style={{ marginTop: 14 }}>
          <div className="panel panel-pad">
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span className="slabel">Transcript</span>
              <span className="field-note">Auto-transcribed &middot; editable</span>
            </div>
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={8}
              style={{
                width: "100%",
                background: "var(--card)",
                border: "1px solid var(--border-2)",
                borderRadius: 8,
                padding: "11px 13px",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                color: "var(--foreground)",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
            <button
              onClick={submitForEvaluation}
              className="btn-design btn-design-primary"
              style={{ width: "100%", height: 46, fontSize: 14.5, marginTop: 16 }}
            >
              Evaluate answer &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Evaluation results */}
      {state === "done" && evaluation && (
        <div style={{ marginTop: 24 }}>
          <EvaluationResult evaluation={evaluation} transcription={transcription} />
          <div className="flex" style={{ gap: 10, marginTop: 28 }}>
            <button onClick={reset} className="btn-design btn-design-ghost">
              Try again
            </button>
          </div>
        </div>
      )}

      {state === "error" && (
        <div style={{ marginTop: 24 }}>
          <button onClick={reset} className="btn-design btn-design-ghost">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
