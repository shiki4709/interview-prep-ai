import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const interviews = sqliteTable("interviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("company_name").notNull(),
  roleName: text("role_name").notNull(),
  jobDescription: text("job_description").notNull(),
  interviewerName: text("interviewer_name"),
  interviewerBackground: text("interviewer_background"),
  generatedAt: text("generated_at"),
  createdAt: text("created_at").notNull(),
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  interviewId: integer("interview_id").notNull(),
  category: text("category").notNull(),
  question: text("question").notNull(),
  intent: text("intent"),
  evaluationCriteria: text("evaluation_criteria"),
  sortOrder: integer("sort_order").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: integer("question_id").notNull(),
  interviewId: integer("interview_id").notNull(),
  transcription: text("transcription"),
  duration: integer("duration"),
  overallVerdict: text("overall_verdict"),
  feedback: text("feedback"),
  createdAt: text("created_at").notNull(),
});
