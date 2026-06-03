import { InterviewForm } from "@/components/InterviewForm";

export default function NewInterviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading tracking-tight">
          New Interview
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Drop in the role &mdash; HappyPrep reads the description and pulls out everything it needs to write your questions.
        </p>
      </div>
      <InterviewForm />
    </div>
  );
}
