import Link from "next/link";
import { InterviewForm } from "@/components/InterviewForm";

export default function NewInterviewPage() {
  return (
    <div>
      <Link href="/" className="back-link">
        <span>&larr;</span> Interviews
      </Link>

      <div className="page-head">
        <div>
          <h1 className="display" style={{ fontSize: 42 }}>
            New interview
          </h1>
          <p
            style={{
              color: "var(--text-2)",
              fontSize: 14,
              marginTop: 10,
              maxWidth: "48ch",
            }}
          >
            Drop in the role &mdash; HappyPrep reads the description and pulls
            out everything it needs to write your questions.
          </p>
        </div>
      </div>

      <div className="panel panel-pad" style={{ marginTop: 28, maxWidth: 660 }}>
        <InterviewForm />
      </div>
    </div>
  );
}
