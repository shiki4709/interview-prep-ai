"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InterviewForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      companyName: formData.get("companyName"),
      roleName: formData.get("roleName"),
      jobDescription: formData.get("jobDescription"),
      interviewerName: formData.get("interviewerName") || null,
      interviewerBackground: formData.get("interviewerBackground") || null,
    };

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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>New Interview</CardTitle>
        <CardDescription>
          Paste the job description and we'll generate tailored practice
          questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Acme Corp"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                name="roleName"
                placeholder="Senior Product Manager"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              name="jobDescription"
              placeholder="Paste the full job description here..."
              rows={10}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interviewerName">
                Interviewer Name{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="interviewerName"
                name="interviewerName"
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewerBackground">
                Interviewer Background{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="interviewerBackground"
                name="interviewerBackground"
                placeholder="VP of Engineering, 10 years at the company..."
                rows={3}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Interview"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
