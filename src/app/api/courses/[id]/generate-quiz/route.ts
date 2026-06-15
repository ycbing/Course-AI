import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne, query } from "@/lib/db";
import { deductCredits } from "@/lib/db";
import { chatCompletion } from "@/lib/ai/glm-client";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-generate-quiz");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    // Verify ownership
    const course = await queryOne<any>(
      `SELECT * FROM courses WHERE id = $1 AND user_id = $2`,
      [courseId, userId]
    );
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    const sections = await query<any>(
      `SELECT section_number, title, content FROM course_sections WHERE course_id = $1 ORDER BY section_number`,
      [courseId]
    );
    if (sections.length === 0) {
      return NextResponse.json({ error: "课程还没有教学段落，无法生成测验" }, { status: 400 });
    }

    // Check credits (5 credits for quiz generation)
    const user = await queryOne<{ credits: number }>(
      `SELECT credits FROM users WHERE id = $1`,
      [userId]
    );
    if (!user || user.credits < 5) {
      return NextResponse.json({ error: "积分不足，生成测验需要 5 积分", code: "INSUFFICIENT_CREDITS" }, { status: 402 });
    }

    // Build prompt for quiz generation
    const sectionsText = sections
      .map((s, i) => `段落${s.section_number}: ${s.title}\n${s.content.substring(0, 300)}`)
      .join("\n\n---\n\n");

    const messages = [
      {
        role: "system" as const,
        content: `你是一位专业的教育出题专家。根据提供的教学内容，为每个章节生成 2-3 道测验题。

要求：
1. 题目类型包括：choice（单选题，4个选项）、truefalse（判断题）、fillblank（填空题）
2. 题目难度适合对应年级的学生
3. 答案必须准确，解析要清晰易懂
4. 每个章节至少 2 道题，最多 3 道
5. 严格按 JSON 格式输出

输出严格遵循以下 JSON 格式（数组）：
[
  {
    "sectionNumber": 1,
    "sectionTitle": "段落标题",
    "type": "choice",
    "question": "题目内容",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "answer": "正确答案",
    "explanation": "解析说明"
  },
  {
    "sectionNumber": 1,
    "sectionTitle": "段落标题",
    "type": "truefalse",
    "question": "题目内容",
    "answer": "正确",
    "explanation": "解析说明"
  },
  {
    "sectionNumber": 2,
    "sectionTitle": "段落标题",
    "type": "fillblank",
    "question": "______是细胞生命活动的基本单位。",
    "answer": "细胞",
    "explanation": "解析说明"
  }
]`,
      },
      {
        role: "user" as const,
        content: `课程标题：${course.title}\n学科：${course.subject || "通用"}\n年级：${course.grade || "不限"}\n\n教学内容：\n${sectionsText}\n\n请为以上每个教学段落生成测验题。`,
      },
    ];

    const raw = await chatCompletion(messages, {
      temperature: 0.5,
      maxTokens: 4096,
    });

    // Parse quiz questions
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("AI 返回的测验格式错误");
    }

    const questions = JSON.parse(jsonMatch[0]).map((q: any, idx: number) => ({
      id: `q_${idx + 1}`,
      sectionNumber: q.sectionNumber || 1,
      sectionTitle: q.sectionTitle || "未命名",
      type: q.type || "choice",
      question: q.question || "",
      options: q.options || [],
      answer: q.answer || "",
      explanation: q.explanation || "",
    }));

    // Save quiz data to course
    await query(
      `UPDATE courses SET quiz_data = $2, updated_at = NOW() WHERE id = $1`,
      [courseId, JSON.stringify(questions)]
    );

    // Deduct credits
    await deductCredits(userId, 5, "generate_quiz", courseId, {
      title: course.title,
      question_count: questions.length,
    });

    log.info("Quiz generated", { courseId, questionCount: questions.length });

    return NextResponse.json({ success: true, questions });
  } catch (err) {
    log.error("Generate quiz error", { error: String(err) });
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("401") || errMsg.includes("余额")) {
      return NextResponse.json(
        { error: "AI 服务暂时不可用（余额不足），请稍后再试", code: "AI_UNAVAILABLE" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "生成测验失败: " + errMsg }, { status: 500 });
  }
}
