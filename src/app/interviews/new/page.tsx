import { InterviewForm } from "@/components/InterviewForm";

export default function NewInterviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold tracking-tight">
          New Interview
        </h1>
        <p className="text-muted-foreground mt-1">
          Add the role details and we'll generate custom practice questions.
        </p>
      </div>
      <InterviewForm />
    </div>
  );
}
