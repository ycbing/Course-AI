import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne } from "@/lib/db";
import { chatCompletion } from "@/lib/ai/glm-client";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-generate-outline");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const body = await req.json();
    const { topic, subject, grade, sectionCount } = body;

    if (!topic?.trim()) {
      return NextResponse.json({ error: "请输入课程主题" }, { status: 400 });
    }

    // Verify course ownership
    const course = await queryOne<any>(
      `SELECT * FROM courses WHERE id = $1 AND user_id = $2`,
      [courseId, userId]
    );
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    // Generate outline with AI (no credits charged - just preview)
    const messages = [
      {
        role: "system" as const,
        content: `你是一位资深的教学大纲设计专家。根据用户提供的主题和教学信息，设计一份结构清晰、逻辑严密的教学大纲。

要求：
1. 生成 ${sectionCount || 6} 个教学章节
2. 每个章节包含 3-5 个知识点
3. 每个章节标注重点难点
4. 每个章节建议合理的教学时长
5. 知识点由浅入深，循序渐进
6. 适合 ${grade || "高中"}学生的认知水平

输出严格遵循以下 JSON 格式：
[
  {
    "title": "章节标题",
    "topics": ["知识点1", "知识点2", "知识点3"],
    "keyPoints": ["重点1", "难点2"],
    "duration": 10
  }
]`,
      },
      {
        role: "user" as const,
        content: `主题：${topic}
${subject ? `学科：${subject}` : ""}
${grade ? `年级：${grade}` : ""}

请为以上主题设计教学大纲。`,
      },
    ];

    const raw = await chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 2048,
    });

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("AI 返回的大纲格式错误");
    }

    const outline = JSON.parse(jsonMatch[0]);

    log.info("Outline generated", { courseId, chapterCount: outline.length });
    return NextResponse.json({ outline });
  } catch (err) {
    log.error("Generate outline error", { error: String(err) });
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("401") || errMsg.includes("余额")) {
      return NextResponse.json(
        { error: "AI 服务暂时不可用，请稍后再试", code: "AI_UNAVAILABLE" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "生成大纲失败: " + errMsg }, { status: 500 });
  }
}
