"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InterviewSummary {
  readonly id: number;
  readonly companyName: string;
  readonly roleName: string;
  readonly generatedAt: string | null;
  readonly createdAt: string;
  readonly questionCount: number;
}

export default function HomePage() {
  const [interviews, setInterviews] = useState<readonly InterviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/interviews");
        const data = await res.json();
        if (data.success) {
          setInterviews(data.data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground mt-1">
            Practice with AI-generated questions tailored to each role.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/history">
            <Button variant="outline">History</Button>
          </Link>
          <Link href="/interviews/new">
            <Button>New Interview</Button>
          </Link>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </p>
      )}

      {!loading && interviews.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No interviews yet. Create one to get started.
            </p>
            <Link href="/interviews/new">
              <Button variant="outline">Create Your First Interview</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {interviews.map((interview) => (
          <Link key={interview.id} href={`/interviews/${interview.id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {interview.companyName}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {new Date(interview.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardDescription>{interview.roleName}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">
                  {interview.questionCount > 0
                    ? `${interview.questionCount} questions`
                    : "No questions generated yet"}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
