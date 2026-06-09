import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

/* ─── Users table (for NextAuth) ─── */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  credits: integer("credits").notNull().default(100),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/* ─── Accounts table (for NextAuth credential adapter) ─── */
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

/* ─── Verification tokens ─── */
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().primaryKey(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/* ─── Courses table ─── */
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  subject: text("subject"),
  grade: text("grade"),
  outline: text("outline"),
  voiceName: text("voice_name").default("zh-CN-YunyangNeural").notNull(),
  voiceRate: real("voice_rate").default(1.0),
  videoAspect: text("video_aspect").default("landscape"),
  videoUrl: text("video_url"),
  pdfUrl: text("pdf_url"),
  pptxUrl: text("pptx_url"),
  theme: text("theme").default("business"),
  coverUrl: text("cover_url").default(""),
  duration: real("duration"),
  status: text("status").default("draft").notNull(), // draft | generating | completed | error
  progressStep: text("progress_step"),
  sectionCount: integer("section_count").default(0),
  shareToken: text("share_token"),
  shareCount: integer("share_count").default(0),
  errorMessage: text("error_message").default(""),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/* ─── Course Sections table ─── */
export const courseSections = pgTable("course_sections", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  sectionNumber: integer("section_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").default(""),
  audioUrl: text("audio_url").default(""),
  duration: real("duration"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/* ─── Model Configs (global) ─── */
export const modelConfigs = pgTable("model_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: text("category").notNull().unique(), // llm, tts, image
  provider: text("provider").notNull(),
  modelName: text("model_name").notNull(),
  apiKey: text("api_key"),
  baseUrl: text("base_url"),
  config: jsonb("config").default({}),
  enabled: integer("enabled").default(1),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/* ─── User Model Configs (user-provided keys) ─── */
export const userModelConfigs = pgTable("user_model_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  provider: text("provider").notNull(),
  modelName: text("model_name").notNull(),
  apiKey: text("api_key").notNull(),
  baseUrl: text("base_url"),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/* ─── Type helpers ─── */
import { real } from "drizzle-orm/pg-core";

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type CourseSection = typeof courseSections.$inferSelect;
export type NewCourseSection = typeof courseSections.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
