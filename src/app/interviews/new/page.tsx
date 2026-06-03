import Link from "next/link";
import { InterviewForm } from "@/components/InterviewForm";

export default function NewInterviewPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-block font-mono text-[11px] text-muted-foreground tracking-[0.2em] uppercase hover:text-foreground transition-colors"
      >
        &larr; Interviews
      </Link>

      <div>
        <h1 className="text-3xl font-heading tracking-tight">
          New Interview
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
          Drop in the role &mdash; HappyPrep reads the description and pulls out
          everything it needs to write your questions.
        </p>
      </div>

      <InterviewForm />
    </div>
  );
}
