import { NextRequest, NextResponse } from "next/server";
import {
  textbookTemplates,
  filterTemplates,
  getTemplateSubjects,
  getTemplatePublishers,
  getTemplateGrades,
} from "@/data/textbook-templates";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject") || undefined;
  const grade = searchParams.get("grade") || undefined;
  const publisher = searchParams.get("publisher") || undefined;
  const search = searchParams.get("search") || undefined;

  const filtered = filterTemplates({ subject, grade, publisher, search });

  return NextResponse.json({
    templates: filtered.map((t) => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      grade: t.grade,
      publisher: t.publisher,
      coverIcon: t.coverIcon,
      chapterCount: t.chapters.length,
      chapters: t.chapters.map((c) => ({
        id: c.id,
        title: c.title,
        topicCount: c.topics.length,
        keyPoints: c.keyPoints,
        duration: c.duration,
      })),
    })),
    filters: {
      subjects: getTemplateSubjects(),
      publishers: getTemplatePublishers(),
      grades: getTemplateGrades(),
    },
  });
}
