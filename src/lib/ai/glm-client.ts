import { createLogger } from "../logger";

const log = createLogger("glm-client");

const API_KEY = process.env.GLM_API_KEY || "";
const BASE_URL = process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";
const LLM_MODEL = process.env.LLM_MODEL || "glm-4-flash";
// Wanx (阿里万相) image generation
const WANX_API_KEY = process.env.DASHSCOPE_API_KEY || "";
const WANX_BASE_URL = process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
const WANX_MODEL = process.env.WANX_MODEL || "wan2.7-image-pro";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Call GLM chat completion API.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<string> {
  const model = options?.model || LLM_MODEL;
  const url = `${BASE_URL}/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    log.error(`GLM API failed: ${res.status}`, { error: err });
    throw new Error(`GLM API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * Generate teaching script sections from a topic.
 */
export async function generateTeachingScript(
  topic: string,
  subject?: string,
  grade?: string,
  outline?: string,
  sectionCount: number = 5,
  visualStyle?: string
): Promise<Array<{ title: string; content: string; imagePrompt: string }>> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `你是一位专业的教学课件设计专家。你将根据用户提供的主题，设计一份完整的教学文案，分为多个教学段落。每个段落包含标题、正文内容和配图提示。

要求：
1. 文案必须包含恰好 ${sectionCount} 个教学段落
2. 每个段落内容 250-450 字，内容要详实充实，包含具体知识点的讲解、举例说明或逻辑推导
3. 语言通俗易懂，适合学生理解，逻辑清晰
4. 语言风格适合教师课堂讲授，自然流畅，有亲和力
5. 每个段落的配图提示（imagePrompt）必须遵循以下规则：
   - 必须是英文，详细且具体（50-100个英文单词）
   - 必须包含该段落核心教学内容的视觉元素
   - 指定画面构图：主体位置、视角、背景环境
   - 指定绘画风格：educational illustration, clean, modern, vector art style, flat design
   - 包含色彩提示：使用自然明亮的配色，适合教学场景
   - 示例："A detailed educational illustration showing a plant cell with clearly labeled nucleus, mitochondria and chloroplasts in soft blue and green tones, science textbook diagram style, centered composition on white background, flat vector art"
   - 禁止使用抽象符号或无意义的装饰元素
6. 配图提示应该是教学插图风格，清晰直观，有教学指导价值
${visualStyle ? `7. 所有配图提示必须包含以下风格关键词：${visualStyle}\n` : ""}
输出严格遵循以下 JSON 格式：
[
  {
    "title": "段落标题",
    "content": "段落正文内容",
    "imagePrompt": "Detailed English prompt describing a specific educational scene, educational illustration style, vector art, clean and informative"
  }
]`,
    },
    {
      role: "user",
      content: `主题：${topic}
${subject ? `学科：${subject}` : ""}
${grade ? `年级：${grade}` : ""}
${outline ? `大纲参考：${outline}` : ""}
请生成 ${sectionCount} 个教学段落。`,
    },
  ];

  const raw = await chatCompletion(messages, {
    temperature: 0.7,
    maxTokens: 4096,
  });

  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found");
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid structure");
    return parsed.map((s: { title: string; content: string; imagePrompt: string }) => ({
      title: s.title || "未命名段落",
      content: s.content || "",
      imagePrompt: s.imagePrompt || "educational illustration",
    }));
  } catch (err) {
    log.error("Failed to parse teaching script", { error: String(err), raw });
    throw new Error("AI 生成教学文案格式错误");
  }
}

/**
 * Generate teaching illustration image using Wanx (阿里万相).
 */
export async function generateImage(
  prompt: string,
  size: string = "1024x1024"
): Promise<string> {
  if (!WANX_API_KEY) {
    throw new Error("DASHSCOPE_API_KEY not configured");
  }
  return generateImageWanx(prompt, size);
}

/**
 * Wanx (阿里万相) image generation — DPG-Bench SOTA
 */
async function generateImageWanx(
  prompt: string,
  size: string = "1024x1024",
  retries: number = 2
): Promise<string> {
  const [w, h] = size.split("x").map(Number);
  const totalPixels = w * h;
  const wanxSize = totalPixels <= 1024 * 1024 ? "1K" : "2K";

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(WANX_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WANX_API_KEY}`,
        },
        signal: AbortSignal.timeout(120_000), // 120s timeout for image generation
        body: JSON.stringify({
          model: WANX_MODEL,
          input: {
            messages: [
              {
                role: "user",
                content: [{ text: prompt }],
              },
            ],
          },
          parameters: {
            size: wanxSize,
            n: 1,
            watermark: false,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        log.error(`Wanx API failed: ${res.status} (attempt ${attempt + 1}/${retries + 1})`, { error: err });
        if (attempt === retries) {
          throw new Error(`Wanx API failed after ${retries + 1} attempts: ${res.status}`);
        }
        continue;
      }

      const data = await res.json();
      const imageItem = data.output?.choices?.[0]?.message?.content?.find(
        (c: any) => c.type === "image"
      );
      if (!imageItem?.image) {
        log.warn(`Wanx returned no image (attempt ${attempt + 1}/${retries + 1})`);
        if (attempt === retries) {
          throw new Error("Wanx returned no image after all retries");
        }
        continue;
      }

      log.info(`Wanx image generated successfully (attempt ${attempt + 1})`);
      return imageItem.image;
    } catch (err: any) {
      log.error(`Wanx fetch error (attempt ${attempt + 1}/${retries + 1}): ${err.message}`);
      if (attempt === retries) {
        throw new Error(`Wanx generation failed: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  throw new Error("Wanx generation failed after all retries");
}

/**
 * Subject-specific visual rules for image prompts.
 */
const SUBJECT_VISUAL_RULES: Record<string, string> = {
  math: "Include mathematical formulas, geometric shapes, coordinate systems, graphs, or numerical diagrams. Show equations visually.",
  physics: "Include experimental apparatus, force diagrams, energy transfer diagrams, wave patterns, or physical phenomena illustrations.",
  chemistry: "Include molecular structures, chemical formulas, lab equipment, reaction diagrams, or periodic table elements.",
  biology: "Include cell structures, organ diagrams, anatomy illustrations, ecosystem diagrams, or plant/animal features.",
  history: "Include historical scenes, period-accurate architecture, cultural artifacts, portraits in historical context, or timeline illustrations.",
  geography: "Include topographic maps, terrain cross-sections, climate zone diagrams, satellite views, or geographical feature illustrations.",
  programming: "Include code editor interfaces, algorithm flowcharts, data structure visualizations, or system architecture diagrams.",
  computer_science: "Include code editor interfaces, algorithm flowcharts, data structure visualizations, or system architecture diagrams.",
  science: "Include scientific diagrams, experimental setups, natural phenomena illustrations, or data visualization charts.",
  chinese: "Include Chinese calligraphy elements, classical architecture, literary scene illustrations, or cultural symbols.",
  english: "Include language learning scenes, grammar diagrams, vocabulary illustrations, or Western literary scene illustrations.",
  art: "Include art technique demonstrations, color theory diagrams, famous artwork references, or creative process illustrations.",
  music: "Include musical notation, instrument diagrams, waveform visualizations, or performance scene illustrations.",
  pe: "Include sports action scenes, exercise posture diagrams, athletic field illustrations, or fitness equipment illustrations.",
  politics: "Include government structure diagrams, civic concept illustrations, debate scene illustrations, or organizational charts.",
};

const DEFAULT_SUBJECT_RULE = "Include clear diagrams, informative labels, and educational visual elements suitable for teaching materials.";

/**
 * Refine an image prompt for better generation accuracy.
 * Independent call from script generation — focused solely on prompt quality.
 */
export async function refineImagePrompt(
  sectionTitle: string,
  sectionContent: string,
  subject?: string,
  visualStyle?: string
): Promise<string> {
  // PPT-style visual keywords by style name
  const STYLE_MAP: Record<string, string> = {
    classic: "professional PowerPoint slide design, clean corporate presentation style, white background with subtle blue accent bar at top, clear layout with title area and content area, modern sans-serif typography aesthetic, professional infographic quality, 16:9 aspect ratio composition",
    modern: "modern minimalist presentation slide, clean white background, geometric accent shapes (circles, rounded rectangles), vibrant primary colors with ample white space, flat infographic icons, Material Design inspired, clean hierarchy with bold titles and structured content blocks",
    vibrant: "vibrant colorful presentation slide, gradient backgrounds (blue to purple or teal to blue), bold white typography, dynamic layout with icons and data visualization elements, energetic and engaging visual style, modern infographic poster quality",
    minimal: "minimalist clean presentation slide, pure white background with thin elegant accent lines, single accent color (navy or teal), generous whitespace, simple line icons, Swiss design inspired, ultra-clean typography, understated professional look",
    elegant: "elegant presentation slide, soft muted color palette (dusty blue, sage green, warm gray), refined serif headings with clean sans-serif body text, subtle watercolor-style decorative accents, premium professional feel, sophisticated infographic quality",
  };

  const styleKeywords = STYLE_MAP[visualStyle || ""] || STYLE_MAP["modern"] || "professional PowerPoint slide design, clean corporate presentation style, white background, modern infographic quality";
  const subjectKey = (subject || "").toLowerCase();
  const subjectRule = SUBJECT_VISUAL_RULES[subjectKey] || DEFAULT_SUBJECT_RULE;

  // Extract key concepts from content for more specific prompts
  const contentExcerpt = sectionContent.slice(0, 300);

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are an expert educational image prompt engineer. Your task is to generate a precise, detailed English image generation prompt for creating PowerPoint-style courseware illustrations.

Rules:
1. English only, 80-120 words
2. Must include SPECIFIC visual elements from the teaching content (not generic "educational illustration")
3. Layout: 16:9 widescreen PowerPoint slide composition with clear visual hierarchy
4. Style: ${styleKeywords}
5. Include color palette description
6. Subject-specific rules: ${subjectRule}
7. NO abstract symbols, NO meaningless decorative elements, NO clip-art style icons
8. The image should clearly convey the teaching concept visually, suitable for projection in classroom
9. Include text labels, formulas, or annotations if they help explain the concept
10. Text elements must be clearly readable (white text on dark background or dark text on light background)

Output format: Output ONLY the image prompt text, nothing else. No explanation, no quotes.

Example good prompt:
"A professional PowerPoint slide illustration showing the water cycle with clearly labeled stages: evaporation (blue gradient arrow rising from ocean surface), condensation (gray cloud formation with rain icon), precipitation (rain drops with splash effect), and collection (river flowing back to ocean). Clean white background, corporate blue color scheme with accent bar at top. Large bold title 'Water Cycle' at top. Flat infographic icons at each stage with connecting arrows. 16:9 widescreen layout, professional presentation quality, clean sans-serif labels."`,
    },
    {
      role: "user",
      content: `Section title: ${sectionTitle}

Section content (excerpt):
${contentExcerpt}

Generate a precise PowerPoint-style image generation prompt for this teaching section.`,
    },
  ];

  const raw = await chatCompletion(messages, {
    temperature: 0.6,
    maxTokens: 512,
  });

  // Clean up quotes if present
  let prompt = raw.trim();
  if (prompt.startsWith('"') && prompt.endsWith('"')) {
    prompt = prompt.slice(1, -1);
  }
  if (prompt.startsWith('\'') && prompt.endsWith('\'')) {
    prompt = prompt.slice(1, -1);
  }

  log.info("Refined image prompt", { title: sectionTitle, promptLength: prompt.length });
  return prompt;
}
