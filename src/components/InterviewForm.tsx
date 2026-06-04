"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InputMode = "text" | "link";

interface LinkFieldState {
  readonly mode: InputMode;
  readonly url: string;
  readonly text: string;
  readonly loading: boolean;
  readonly error: string | null;
  readonly pasteMode: boolean;
  readonly pastedText: string;
}

interface InterviewerState {
  readonly url: string;
  readonly name: string;
  readonly background: string;
  readonly loading: boolean;
  readonly error: string | null;
  readonly fetched: boolean;
  readonly pasteMode: boolean;
  readonly pastedText: string;
}

function createLinkFieldState(): LinkFieldState {
  return { mode: "link", url: "", text: "", loading: false, error: null, pasteMode: false, pastedText: "" };
}

function isUrl(value: string): boolean {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed);
}

export function InterviewForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");

  const [jd, setJd] = useState<LinkFieldState>(createLinkFieldState());
  const [interviewer, setInterviewer] = useState<InterviewerState>({
    url: "",
    name: "",
    background: "",
    loading: false,
    error: null,
    fetched: false,
    pasteMode: false,
    pastedText: "",
  });

  async function fetchJdUrl(url: string) {
    const normalizedUrl = url.startsWith("www.") ? `https://${url}` : url;
    setJd((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl, type: "jd" }),
      });

      const data = await res.json();

      if (!data.success) {
        setJd((prev) => ({ ...prev, loading: false, error: null, pasteMode: true }));
        return;
      }

      const jdText =
        typeof data.data === "string"
          ? data.data
          : typeof data.data?.jobDescription === "string"
            ? data.data.jobDescription
            : typeof data.data?.text === "string"
              ? data.data.text
              : String(data.data ?? "");

      if (!jdText || jdText === "[object Object]") {
        setJd((prev) => ({ ...prev, loading: false, error: null, pasteMode: true }));
        return;
      }

      setJd((prev) => ({ ...prev, text: jdText, loading: false, pasteMode: false }));
      if (data.data?.companyName) setCompanyName(String(data.data.companyName));
      if (data.data?.roleName) setRoleName(String(data.data.roleName));
    } catch {
      setJd((prev) => ({ ...prev, loading: false, error: null, pasteMode: true }));
    }
  }

  async function processJdText(text: string) {
    setJd((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch("/api/scrape/parse-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!data.success) {
        setJd((prev) => ({ ...prev, loading: false, error: data.error || "Failed to parse" }));
        return;
      }
      setJd((prev) => ({ ...prev, text: String(data.data?.jobDescription ?? ""), loading: false, pasteMode: false }));
      if (data.data?.companyName) setCompanyName(String(data.data.companyName));
      if (data.data?.roleName) setRoleName(String(data.data.roleName));
    } catch {
      setJd((prev) => ({ ...prev, loading: false, error: "Failed to parse text" }));
    }
  }

  async function fetchInterviewerProfile(url: string) {
    const normalizedUrl = url.startsWith("www.") ? `https://${url}` : url;
    setInterviewer((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch("/api/lookup-person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });
      const data = await res.json();
      if (!data.success) {
        setInterviewer((prev) => ({ ...prev, loading: false, error: null, pasteMode: true }));
        return;
      }
      setInterviewer((prev) => ({
        ...prev,
        name: data.data.name,
        background: data.data.background,
        loading: false,
        fetched: true,
      }));
    } catch {
      setInterviewer((prev) => ({ ...prev, loading: false, error: "Failed to fetch profile" }));
    }
  }

  async function processInterviewerText(text: string) {
    setInterviewer((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch("/api/scrape/parse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!data.success) {
        setInterviewer((prev) => ({ ...prev, loading: false, error: data.error || "Failed to parse profile" }));
        return;
      }
      setInterviewer((prev) => ({
        ...prev,
        name: data.data.name,
        background: data.data.background,
        loading: false,
        fetched: true,
        pasteMode: false,
      }));
    } catch {
      setInterviewer((prev) => ({ ...prev, loading: false, error: "Failed to parse profile" }));
    }
  }

  function handleJdPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text");
    if (isUrl(pasted)) {
      e.preventDefault();
      setJd((prev) => ({ ...prev, mode: "link", url: pasted }));
      fetchJdUrl(pasted);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      companyName,
      roleName,
      jobDescription: jd.text,
      interviewerName: interviewer.name || null,
      interviewerBackground: interviewer.background || null,
    };

    if (!payload.jobDescription) {
      setError(
        jd.mode === "link"
          ? "Please fetch a job description link first"
          : "Job description is required"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Something went wrong");
        return;
      }
      router.push(`/interviews/${data.data.id}`);
    } catch {
      setError("Failed to create interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Job Description */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span className="slabel">Job description</span>
          <div
            style={{
              display: "inline-flex",
              padding: 3,
              background: "var(--accent)",
              borderRadius: 8,
              gap: 3,
            }}
          >
            <button
              type="button"
              onClick={() => setJd((prev) => ({ ...createLinkFieldState(), text: prev.text, mode: "text" }))}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                padding: "5px 12px",
                borderRadius: 5,
                border: "none",
                cursor: "pointer",
                background: jd.mode === "text" ? "var(--card)" : "transparent",
                color: jd.mode === "text" ? "var(--foreground)" : "var(--text-3)",
                fontWeight: jd.mode === "text" ? 500 : 400,
                boxShadow: jd.mode === "text" ? "0 1px 2px oklch(0 0 0 / 0.08)" : "none",
                transition: "all 0.12s",
              }}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => setJd((prev) => ({ ...prev, mode: "link" }))}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                padding: "5px 12px",
                borderRadius: 5,
                border: "none",
                cursor: "pointer",
                background: jd.mode === "link" ? "var(--card)" : "transparent",
                color: jd.mode === "link" ? "var(--foreground)" : "var(--text-3)",
                fontWeight: jd.mode === "link" ? 500 : 400,
                boxShadow: jd.mode === "link" ? "0 1px 2px oklch(0 0 0 / 0.08)" : "none",
                transition: "all 0.12s",
              }}
            >
              Link
            </button>
          </div>
        </div>

        {jd.mode === "link" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="https://jobs.lever.co/company/role..."
                value={jd.url}
                onChange={(e) => setJd((prev) => ({ ...prev, url: e.target.value }))}
                style={{
                  flex: 1,
                  background: "var(--card)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 8,
                  padding: "11px 13px",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  color: "var(--foreground)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                disabled={jd.loading || !jd.url}
                onClick={() => fetchJdUrl(jd.url)}
                className="btn-design btn-design-ghost"
                style={{ height: 42 }}
              >
                {jd.loading ? "Fetching..." : "Fetch"}
              </button>
            </div>
            {jd.error && <span className="field-note" style={{ color: "var(--destructive)" }}>{jd.error}</span>}
            {jd.pasteMode && !jd.text && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span className="field-note">This site blocks direct fetching. Paste the job description below.</span>
                <textarea
                  placeholder="Paste the job description text here..."
                  value={jd.pastedText}
                  onChange={(e) => setJd((prev) => ({ ...prev, pastedText: e.target.value }))}
                  rows={10}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border-2)",
                    borderRadius: 8,
                    padding: "11px 13px",
                    fontSize: 14,
                    fontFamily: "var(--font-sans)",
                    color: "var(--foreground)",
                    outline: "none",
                    resize: "vertical",
                    minHeight: 120,
                    lineHeight: 1.6,
                  }}
                />
                <button
                  type="button"
                  disabled={jd.loading || !jd.pastedText}
                  onClick={() => processJdText(jd.pastedText)}
                  className="btn-design btn-design-ghost"
                >
                  {jd.loading ? "Processing..." : "Extract Details"}
                </button>
              </div>
            )}
            {jd.text && (
              <textarea
                value={jd.text}
                onChange={(e) => setJd((prev) => ({ ...prev, text: e.target.value }))}
                rows={10}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 8,
                  padding: "11px 13px",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  color: "var(--foreground)",
                  outline: "none",
                  resize: "vertical",
                  minHeight: 120,
                  lineHeight: 1.6,
                }}
              />
            )}
          </div>
        ) : (
          <textarea
            placeholder="Paste the full job description — or a link to it — and we'll auto-extract the company, role, and the details that matter."
            value={jd.text}
            onChange={(e) => setJd((prev) => ({ ...prev, text: e.target.value }))}
            onPaste={handleJdPaste}
            rows={6}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              padding: "11px 13px",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              color: "var(--foreground)",
              outline: "none",
              resize: "vertical",
              minHeight: 120,
              lineHeight: 1.6,
              width: "100%",
            }}
          />
        )}
        <span className="field-note">
          Tip: include the &quot;About the team&quot; section — it sharpens behavioral questions.
        </span>
      </div>

      {/* Auto-extracted indicator + Company/Role fields (only show when extracted or in text mode) */}
      {(jd.mode === "text" || companyName || roleName) && (
        <>
          {(companyName || roleName) && (
            <div className="flex items-center" style={{ gap: 10 }}>
              <span className="tag tag-blue">
                <span className="dot" /> Auto-extracted
              </span>
              <span className="field-note">Edit anything below if we got it wrong.</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="slabel">Company</span>
              <input
                type="text"
                placeholder="Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 8,
                  padding: "11px 13px",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  color: "var(--foreground)",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="slabel">Role</span>
              <input
                type="text"
                placeholder="Senior Product Manager"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 8,
                  padding: "11px 13px",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  color: "var(--foreground)",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Interviewer LinkedIn */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="slabel">Interviewer LinkedIn</span>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="https://linkedin.com/in/jane-smith"
            value={interviewer.url}
            onChange={(e) => setInterviewer((prev) => ({ ...prev, url: e.target.value }))}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (isUrl(pasted)) {
                e.preventDefault();
                setInterviewer((prev) => ({ ...prev, url: pasted }));
                fetchInterviewerProfile(pasted);
              }
            }}
            style={{
              flex: 1,
              background: "var(--card)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              padding: "11px 13px",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              color: "var(--foreground)",
              outline: "none",
            }}
          />
          <button
            type="button"
            disabled={interviewer.loading || !interviewer.url}
            onClick={() => fetchInterviewerProfile(interviewer.url)}
            className="btn-design btn-design-ghost"
            style={{ height: 42 }}
          >
            {interviewer.loading ? "Fetching..." : "Fetch"}
          </button>
        </div>
        <span className="field-note">Optional — helps generate interviewer-specific questions.</span>

        {interviewer.error && (
          <span className="field-note" style={{ color: "var(--destructive)" }}>{interviewer.error}</span>
        )}

        {interviewer.pasteMode && !interviewer.fetched && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span className="field-note">Enter the interviewer&apos;s details manually.</span>
            <input
              placeholder="Full name"
              value={interviewer.name}
              onChange={(e) => setInterviewer((prev) => ({ ...prev, name: e.target.value }))}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border-2)",
                borderRadius: 8,
                padding: "11px 13px",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                color: "var(--foreground)",
                outline: "none",
                width: "100%",
              }}
            />
            <textarea
              placeholder="Current role, company, and relevant background..."
              value={interviewer.background}
              onChange={(e) => setInterviewer((prev) => ({ ...prev, background: e.target.value }))}
              rows={3}
              style={{
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
                width: "100%",
              }}
            />
            <button
              type="button"
              disabled={!interviewer.name}
              onClick={() => setInterviewer((prev) => ({ ...prev, fetched: true, pasteMode: false }))}
              className="btn-design btn-design-ghost"
            >
              Confirm
            </button>
          </div>
        )}

        {interviewer.fetched && (
          <div className="tag" style={{ padding: "6px 12px", gap: 8 }}>
            <span className="dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-3)" }} />
            {interviewer.name}
            {interviewer.background && (
              <span style={{ color: "var(--text-3)", fontWeight: 400 }}>
                &middot; {interviewer.background.slice(0, 60)}
                {interviewer.background.length > 60 ? "..." : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {error && <span className="field-note" style={{ color: "var(--destructive)" }}>{error}</span>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-design btn-design-primary"
        style={{
          width: "100%",
          height: 46,
          fontSize: 14.5,
          opacity: isSubmitting ? 0.5 : 1,
        }}
      >
        {isSubmitting ? "Creating..." : "Create interview & generate questions \u2192"}
      </button>
    </form>
  );
}
