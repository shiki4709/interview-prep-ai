"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  return { mode: "text", url: "", text: "", loading: false, error: null, pasteMode: false, pastedText: "" };
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
        setJd((prev) => ({
          ...prev,
          loading: false,
          error: null,
          pasteMode: true,
        }));
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
        setJd((prev) => ({
          ...prev,
          loading: false,
          error: null,
          pasteMode: true,
        }));
        return;
      }

      setJd((prev) => ({
        ...prev,
        text: jdText,
        loading: false,
        pasteMode: false,
      }));
      if (data.data?.companyName) {
        setCompanyName(String(data.data.companyName));
      }
      if (data.data?.roleName) {
        setRoleName(String(data.data.roleName));
      }
    } catch {
      setJd((prev) => ({
        ...prev,
        loading: false,
        error: null,
        pasteMode: true,
      }));
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
        setJd((prev) => ({
          ...prev,
          loading: false,
          error: data.error || "Failed to parse",
        }));
        return;
      }

      setJd((prev) => ({
        ...prev,
        text: String(data.data?.jobDescription ?? ""),
        loading: false,
        pasteMode: false,
      }));
      if (data.data?.companyName) {
        setCompanyName(String(data.data.companyName));
      }
      if (data.data?.roleName) {
        setRoleName(String(data.data.roleName));
      }
    } catch {
      setJd((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to parse text",
      }));
    }
  }

  async function fetchInterviewerProfile(url: string) {
    const normalizedUrl = url.startsWith("www.") ? `https://${url}` : url;
    setInterviewer((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Use web search for LinkedIn (and any URL) — no scraping needed
      const res = await fetch("/api/lookup-person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await res.json();

      if (!data.success) {
        setInterviewer((prev) => ({
          ...prev,
          loading: false,
          error: null,
          pasteMode: true,
        }));
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
      setInterviewer((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to fetch profile",
      }));
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
        setInterviewer((prev) => ({
          ...prev,
          loading: false,
          error: data.error || "Failed to parse profile",
        }));
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
      setInterviewer((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to parse profile",
      }));
    }
  }

  function handleJdPaste(
    e: React.ClipboardEvent<HTMLTextAreaElement>
  ) {
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

    if (!companyName || !roleName || !payload.jobDescription) {
      setError("Company name, role name, and job description are required");
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                name="roleName"
                placeholder="Senior Product Manager"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Job Description — text or link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="jobDescription">Job Description</Label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setJd((prev) => ({
                      ...createLinkFieldState(),
                      text: prev.text,
                      mode: "text",
                    }))
                  }
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${
                    jd.mode === "text"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setJd((prev) => ({ ...prev, mode: "link" }))}
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${
                    jd.mode === "link"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Link
                </button>
              </div>
            </div>

            {jd.mode === "link" ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://jobs.lever.co/company/role..."
                    value={jd.url}
                    onChange={(e) =>
                      setJd((prev) => ({ ...prev, url: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={jd.loading || !jd.url}
                    onClick={() => fetchJdUrl(jd.url)}
                  >
                    {jd.loading ? "Fetching..." : "Fetch"}
                  </Button>
                </div>
                {jd.error && (
                  <p className="text-xs text-destructive">{jd.error}</p>
                )}
                {jd.pasteMode && !jd.text && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      This site blocks direct fetching. Copy the job posting
                      text and paste it below.
                    </p>
                    <Textarea
                      placeholder="Paste the job description text here..."
                      value={jd.pastedText}
                      onChange={(e) =>
                        setJd((prev) => ({
                          ...prev,
                          pastedText: e.target.value,
                        }))
                      }
                      rows={10}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={jd.loading || !jd.pastedText}
                      onClick={() => processJdText(jd.pastedText)}
                    >
                      {jd.loading ? "Processing..." : "Extract Details"}
                    </Button>
                  </div>
                )}
                {jd.text && (
                  <Textarea
                    id="jobDescription"
                    value={jd.text}
                    onChange={(e) =>
                      setJd((prev) => ({ ...prev, text: e.target.value }))
                    }
                    rows={10}
                    className="text-sm"
                  />
                )}
              </div>
            ) : (
              <Textarea
                id="jobDescription"
                placeholder="Paste the full job description here (or paste a link to auto-fetch)..."
                value={jd.text}
                onChange={(e) =>
                  setJd((prev) => ({ ...prev, text: e.target.value }))
                }
                onPaste={handleJdPaste}
                rows={10}
              />
            )}
          </div>

          {/* Interviewer — LinkedIn URL */}
          <div className="space-y-2">
            <Label>
              Interviewer LinkedIn{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://linkedin.com/in/jane-smith"
                value={interviewer.url}
                onChange={(e) =>
                  setInterviewer((prev) => ({
                    ...prev,
                    url: e.target.value,
                  }))
                }
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text");
                  if (isUrl(pasted)) {
                    e.preventDefault();
                    setInterviewer((prev) => ({ ...prev, url: pasted }));
                    fetchInterviewerProfile(pasted);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={interviewer.loading || !interviewer.url}
                onClick={() => fetchInterviewerProfile(interviewer.url)}
              >
                {interviewer.loading ? "Fetching..." : "Fetch"}
              </Button>
            </div>
            {interviewer.error && (
              <p className="text-xs text-destructive">{interviewer.error}</p>
            )}
            {interviewer.pasteMode && !interviewer.fetched && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Enter the interviewer's details manually.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="Full name"
                    value={interviewer.name}
                    onChange={(e) =>
                      setInterviewer((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                  <Textarea
                    placeholder="Current role, company, and relevant background..."
                    value={interviewer.background}
                    onChange={(e) =>
                      setInterviewer((prev) => ({
                        ...prev,
                        background: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!interviewer.name}
                    onClick={() =>
                      setInterviewer((prev) => ({
                        ...prev,
                        fetched: true,
                        pasteMode: false,
                      }))
                    }
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
            {interviewer.fetched && (
              <div className="rounded-md border p-3 space-y-2 bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {interviewer.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {interviewer.background}
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full h-11">
            {isSubmitting ? "Creating..." : "Create interview & generate questions \u2192"}
          </Button>
        </form>
  );
}
