/**
 * 视觉风格模板
 * 每个模板定义配色方案、配图风格描述、字幕样式
 */

export interface VisualTemplate {
  id: string;
  name: string;
  description: string;
  coverIcon: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  imageStylePrompt: string; // 追加到 AI 生图 prompt 的风格描述
  subtitleStyle: {
    fontFamily: string;
    color: string;
    position: "bottom" | "top" | "center";
    bgColor: string;
  };
  preview: string[]; // 预览色块
}

export const visualTemplates: VisualTemplate[] = [
  {
    id: "classic",
    name: "经典课堂",
    description: "白色背景 + 蓝色强调，简洁专业",
    coverIcon: "BookOpen",
    colors: {
      primary: "#3B82F6",
      secondary: "#60A5FA",
      background: "#FFFFFF",
      text: "#1F2937",
      accent: "#DBEAFE",
    },
    imageStylePrompt: "clean educational illustration style, white background, blue accents, professional textbook style",
    subtitleStyle: {
      fontFamily: "sans-serif",
      color: "#FFFFFF",
      position: "bottom",
      bgColor: "#3B82F6",
    },
    preview: ["#3B82F6", "#60A5FA", "#FFFFFF", "#1F2937"],
  },
  {
    id: "tech",
    name: "科技未来",
    description: "深色背景 + 霓虹色，科技感十足",
    coverIcon: "Rocket",
    colors: {
      primary: "#8B5CF6",
      secondary: "#06B6D4",
      background: "#0F172A",
      text: "#E2E8F0",
      accent: "#7C3AED",
    },
    imageStylePrompt: "futuristic technology style, neon colors, dark background, holographic elements, sci-fi aesthetic",
    subtitleStyle: {
      fontFamily: "monospace",
      color: "#06B6D4",
      position: "bottom",
      bgColor: "#0F172A",
    },
    preview: ["#8B5CF6", "#06B6D4", "#0F172A", "#E2E8F0"],
  },
  {
    id: "handdrawn",
    name: "手绘风格",
    description: "米色背景 + 手绘元素，温暖亲切",
    coverIcon: "Pencil",
    colors: {
      primary: "#D97706",
      secondary: "#F59E0B",
      background: "#FFFBEB",
      text: "#78350F",
      accent: "#FEF3C7",
    },
    imageStylePrompt: "hand-drawn illustration style, warm tones, chalk-like textures, sketch style, friendly and approachable",
    subtitleStyle: {
      fontFamily: "cursive",
      color: "#78350F",
      position: "bottom",
      bgColor: "#FEF3C7",
    },
    preview: ["#D97706", "#F59E0B", "#FFFBEB", "#78350F"],
  },
  {
    id: "chinese",
    name: "中国风",
    description: "水墨元素 + 红金配色，传统美学",
    coverIcon: "Landmark",
    colors: {
      primary: "#DC2626",
      secondary: "#F59E0B",
      background: "#1C1917",
      text: "#FEFCE8",
      accent: "#991B1B",
    },
    imageStylePrompt: "Chinese ink wash painting style, traditional aesthetics, red and gold colors, oriental art, calligraphy elements",
    subtitleStyle: {
      fontFamily: "serif",
      color: "#FEFCE8",
      position: "bottom",
      bgColor: "#991B1B",
    },
    preview: ["#DC2626", "#F59E0B", "#1C1917", "#FEFCE8"],
  },
  {
    id: "cartoon",
    name: "卡通风格",
    description: "鲜艳色彩 + 圆润设计，活泼有趣",
    coverIcon: "Palette",
    colors: {
      primary: "#EC4899",
      secondary: "#8B5CF6",
      background: "#FDF2F8",
      text: "#831843",
      accent: "#FBCFE8",
    },
    imageStylePrompt: "colorful cartoon illustration style, bright colors, rounded shapes, cute characters, playful and fun",
    subtitleStyle: {
      fontFamily: "rounded",
      color: "#FFFFFF",
      position: "center",
      bgColor: "#EC4899",
    },
    preview: ["#EC4899", "#8B5CF6", "#FDF2F8", "#831843"],
  },
  {
    id: "minimal",
    name: "极简黑白",
    description: "黑白灰 + 大留白，高端大气",
    coverIcon: "Square",
    colors: {
      primary: "#18181B",
      secondary: "#71717A",
      background: "#FAFAFA",
      text: "#18181B",
      accent: "#E4E4E7",
    },
    imageStylePrompt: "minimalist black and white illustration, clean lines, geometric shapes, large whitespace, elegant simplicity",
    subtitleStyle: {
      fontFamily: "sans-serif",
      color: "#FFFFFF",
      position: "bottom",
      bgColor: "#18181B",
    },
    preview: ["#18181B", "#71717A", "#FAFAFA", "#E4E4E7"],
  },
  {
    id: "nature",
    name: "自然绿意",
    description: "绿色系 + 植物元素，清新舒适",
    coverIcon: "Leaf",
    colors: {
      primary: "#16A34A",
      secondary: "#22C55E",
      background: "#F0FDF4",
      text: "#14532D",
      accent: "#DCFCE7",
    },
    imageStylePrompt: "nature green style, plant elements, fresh and clean, botanical illustration, organic shapes, eco-friendly aesthetic",
    subtitleStyle: {
      fontFamily: "sans-serif",
      color: "#14532D",
      position: "bottom",
      bgColor: "#DCFCE7",
    },
    preview: ["#16A34A", "#22C55E", "#F0FDF4", "#14532D"],
  },
  {
    id: "space",
    name: "星空探索",
    description: "深蓝星空 + 宇宙元素，神秘浪漫",
    coverIcon: "Sparkles",
    colors: {
      primary: "#6366F1",
      secondary: "#A855F7",
      background: "#0C0A1A",
      text: "#E0E7FF",
      accent: "#312E81",
    },
    imageStylePrompt: "outer space style, starry night sky, cosmic elements, nebula colors, deep blue and purple, astronomical illustrations",
    subtitleStyle: {
      fontFamily: "sans-serif",
      color: "#E0E7FF",
      position: "bottom",
      bgColor: "#312E81",
    },
    preview: ["#6366F1", "#A855F7", "#0C0A1A", "#E0E7FF"],
  },
];

export function getVisualTemplateById(id: string): VisualTemplate | undefined {
  return visualTemplates.find((t) => t.id === id);
}
