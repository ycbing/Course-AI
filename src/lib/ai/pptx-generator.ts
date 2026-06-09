/**
 * PPTX Generator - Pure Node.js implementation using pptxgenjs
 */

import PptxGenJS from "pptxgenjs";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { createLogger } from "@/lib/logger";

const log = createLogger("pptx-generator");

export interface SlideData {
  layout: "cover" | "full-image" | "image-left" | "image-top" | "text-only" | "ending";
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  bullets?: string[];
  sectionNumber?: number;
}

export interface PptxGenerateOptions {
  title: string;
  author?: string;
  theme: "business" | "education" | "minimal" | "tech";
  outputPath: string;
  slides: SlideData[];
}

export interface PptxResult {
  success: boolean;
  outputPath: string;
  slideCount: number;
  theme: string;
  font: string;
  error?: string;
}

// ─── Theme colors ───
const THEMES: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  textOnPrimary: string;
  textOnSecondary: string;
  bulletColor: string;
}> = {
  business: {
    primary: "1E3A5F",
    secondary: "FFFFFF",
    accent: "3B82F6",
    bg: "0F172A",
    textOnPrimary: "FFFFFF",
    textOnSecondary: "333333",
    bulletColor: "5B7A9D",
  },
  education: {
    primary: "2E7D32",
    secondary: "FFFFFF",
    accent: "66BB6A",
    bg: "1B5E20",
    textOnPrimary: "FFFFFF",
    textOnSecondary: "333333",
    bulletColor: "4CAF50",
  },
  minimal: {
    primary: "333333",
    secondary: "FFFFFF",
    accent: "616161",
    bg: "FAFAFA",
    textOnPrimary: "FFFFFF",
    textOnSecondary: "333333",
    bulletColor: "757575",
  },
  tech: {
    primary: "0F172A",
    secondary: "FFFFFF",
    accent: "3B82F6",
    bg: "0F172A",
    textOnPrimary: "FFFFFF",
    textOnSecondary: "94A3B8",
    bulletColor: "3B82F6",
  },
};

// ─── Font ───
const FONT_NAME = "Microsoft YaHei";

// ─── Slide dimensions (inches, 16:9) ───
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ─── Image download helper ───
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    // If COS private bucket URL, use signed proxy
    let downloadUrl = url;
    if (url.includes(".cos.") || url.includes("myqcloud.com")) {
      const { getSignedCosUrl } = await import("@/lib/cos");
      const cosKey = (() => {
        try { const u = new URL(url); return u.pathname; } catch { return url; }
      })();
      downloadUrl = getSignedCosUrl(cosKey, 3600);
    }
    const resp = await fetch(downloadUrl, {
      headers: { "User-Agent": "CourseAI-PPTX/1.0" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!resp.ok) return null;
    const buf = Buffer.from(await resp.arrayBuffer());
    // Validate it looks like an image
    if (buf.length < 100) return null;
    return buf;
  } catch (err) {
    log.warn("Failed to download image", { url, error: String(err) });
    return null;
  }
}

// Detect if buffer is PNG (for pptxgenjs image type)
function imageTypeFromBuffer(buf: Buffer): "png" | "jpg" {
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png"; // PNG magic
  return "jpg";
}

// ─── Layout builders ───

function createCoverSlide(
  pptx: PptxGenJS,
  data: SlideData,
  theme: typeof THEMES[string]
) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.bg };

  // Top accent bar
  slide.addShape("rect", {
    x: 0, y: 0, w: SLIDE_W, h: 0.08,
    fill: { color: theme.accent },
    line: { width: 0 },
  });

  // Title
  slide.addText(data.title, {
    x: 1.5, y: 2.0, w: 10, h: 2,
    fontSize: 44, bold: true,
    color: theme.textOnPrimary,
    fontFace: FONT_NAME,
    align: "center",
    valign: "middle",
  });

  // Subtitle
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 1.5, y: 4.2, w: 10, h: 1.5,
      fontSize: 24,
      color: theme.accent,
      fontFace: FONT_NAME,
      align: "center",
      valign: "top",
    });
  }

  // Bottom accent bar
  slide.addShape("rect", {
    x: 0, y: SLIDE_H - 0.08, w: SLIDE_W, h: 0.08,
    fill: { color: theme.accent },
    line: { width: 0 },
  });
}

async function createFullImageSlide(
  pptx: PptxGenJS,
  data: SlideData,
  theme: typeof THEMES[string]
) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.bg };

  // Image
  const imgUrl = data.imageUrl || "";
  if (imgUrl) {
    let imgBuf: Buffer | null = null;
    if (imgUrl.startsWith("http")) {
      imgBuf = await downloadImage(imgUrl);
    } else {
      try {
        imgBuf = await fs.readFile(imgUrl);
      } catch {
        // local file not found
      }
    }
    if (imgBuf) {
      slide.addImage({
        data: `image/${imageTypeFromBuffer(imgBuf)};base64,${imgBuf.toString("base64")}`,
        x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
      });
    }
  }

  // Semi-transparent overlay bar at bottom
  slide.addShape("rect", {
    x: 0, y: SLIDE_H - 2.5, w: SLIDE_W, h: 2.5,
    fill: { color: theme.bg, transparency: 30 },
    line: { width: 0 },
  });

  // Title
  slide.addText(data.title, {
    x: 1, y: SLIDE_H - 2.2, w: 11, h: 1,
    fontSize: 36, bold: true,
    color: theme.textOnPrimary,
    fontFace: FONT_NAME,
    align: "left",
    valign: "middle",
  });

  // Content
  if (data.content) {
    slide.addText(data.content.substring(0, 200), {
      x: 1, y: SLIDE_H - 1.2, w: 11, h: 1,
      fontSize: 16,
      color: theme.accent,
      fontFace: FONT_NAME,
      align: "left",
      valign: "top",
    });
  }
}

async function createImageLeftSlide(
  pptx: PptxGenJS,
  data: SlideData,
  theme: typeof THEMES[string]
) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.secondary };

  // Accent bar at left
  slide.addShape("rect", {
    x: 0, y: 0, w: 0.06, h: SLIDE_H,
    fill: { color: theme.accent },
    line: { width: 0 },
  });

  // Image on left (40%)
  const imgUrl = data.imageUrl || "";
  let hasImage = false;
  if (imgUrl) {
    let imgBuf: Buffer | null = null;
    if (imgUrl.startsWith("http")) {
      imgBuf = await downloadImage(imgUrl);
    } else {
      try {
        imgBuf = await fs.readFile(imgUrl);
      } catch {
        // local file not found
      }
    }
    if (imgBuf) {
      slide.addImage({
        data: `image/${imageTypeFromBuffer(imgBuf)};base64,${imgBuf.toString("base64")}`,
        x: 0.3, y: 0.8, w: 5.0, h: 5.9,
      });
      hasImage = true;
    }
  }

  if (!hasImage) {
    // Placeholder
    slide.addShape("rect", {
      x: 0.3, y: 0.8, w: 5.0, h: 5.9,
      fill: { color: "E0E0E0" },
      line: { color: "CCCCCC", width: 1 },
    });
    slide.addText("📷", {
      x: 0.3, y: 0.8, w: 5.0, h: 5.9,
      fontSize: 48,
      align: "center",
      valign: "middle",
    });
  }

  // Text on right (60%)
  const textLeft = 5.8;
  const textWidth = 6.8;

  // Section number badge
  if (data.sectionNumber) {
    slide.addText(String(data.sectionNumber), {
      x: textLeft, y: 0.8, w: 0.8, h: 0.5,
      fontSize: 16, bold: true,
      color: "FFFFFF",
      fill: { color: theme.accent },
      fontFace: FONT_NAME,
      align: "center",
      valign: "middle",
      shape: "roundRect",
    });
  }

  // Title
  slide.addText(data.title, {
    x: textLeft, y: 1.5, w: textWidth, h: 1.2,
    fontSize: 36, bold: true,
    color: theme.primary,
    fontFace: FONT_NAME,
    align: "left",
    valign: "middle",
  });

  // Bullets or content
  const bullets = data.bullets || [];
  if (bullets.length > 0) {
    const bulletRows = bullets.map((b) => ({
      text: `  ●  ${b}`,
      options: {
        fontSize: 18,
        color: theme.textOnSecondary,
        fontFace: FONT_NAME,
        bullet: false,
        breakLine: true,
        paraSpaceAfter: 8,
      },
    }));
    slide.addText(bulletRows, {
      x: textLeft, y: 3.0, w: textWidth, h: 4.0,
      valign: "top",
    });
  } else if (data.content) {
    slide.addText(data.content, {
      x: textLeft, y: 3.0, w: textWidth, h: 4.0,
      fontSize: 18,
      color: theme.textOnSecondary,
      fontFace: FONT_NAME,
      valign: "top",
    });
  }
}

async function createImageTopSlide(
  pptx: PptxGenJS,
  data: SlideData,
  theme: typeof THEMES[string]
) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.secondary };

  // Accent bar at top
  slide.addShape("rect", {
    x: 0, y: 0, w: SLIDE_W, h: 0.06,
    fill: { color: theme.accent },
    line: { width: 0 },
  });

  // Image on top (50%)
  const imgUrl = data.imageUrl || "";
  let hasImage = false;
  if (imgUrl) {
    let imgBuf: Buffer | null = null;
    if (imgUrl.startsWith("http")) {
      imgBuf = await downloadImage(imgUrl);
    } else {
      try {
        imgBuf = await fs.readFile(imgUrl);
      } catch {
        // local file not found
      }
    }
    if (imgBuf) {
      slide.addImage({
        data: `image/${imageTypeFromBuffer(imgBuf)};base64,${imgBuf.toString("base64")}`,
        x: 0.3, y: 0.3, w: 12.7, h: 3.4,
      });
      hasImage = true;
    }
  }

  if (!hasImage) {
    slide.addShape("rect", {
      x: 0.3, y: 0.3, w: 12.7, h: 3.4,
      fill: { color: "E0E0E0" },
      line: { color: "CCCCCC", width: 1 },
    });
    slide.addText("📷", {
      x: 0.3, y: 0.3, w: 12.7, h: 3.4,
      fontSize: 48,
      align: "center",
      valign: "middle",
    });
  }

  // Text area below
  const textTop = 4.0;
  const textLeft = 1.0;
  const textWidth = 11.3;

  // Title
  slide.addText(data.title, {
    x: textLeft, y: textTop, w: textWidth, h: 1,
    fontSize: 36, bold: true,
    color: theme.primary,
    fontFace: FONT_NAME,
    align: "left",
    valign: "middle",
  });

  // Bullets or content
  const bullets = data.bullets || [];
  if (bullets.length > 0) {
    const bulletRows = bullets.map((b) => ({
      text: `  ●  ${b}`,
      options: {
        fontSize: 18,
        color: theme.textOnSecondary,
        fontFace: FONT_NAME,
        bullet: false,
        breakLine: true,
        paraSpaceAfter: 8,
      },
    }));
    slide.addText(bulletRows, {
      x: textLeft, y: textTop + 1.2, w: textWidth, h: 2.0,
      valign: "top",
    });
  } else if (data.content) {
    slide.addText(data.content, {
      x: textLeft, y: textTop + 1.2, w: textWidth, h: 2.0,
      fontSize: 18,
      color: theme.textOnSecondary,
      fontFace: FONT_NAME,
      valign: "top",
    });
  }
}

function createTextOnlySlide(
  pptx: PptxGenJS,
  data: SlideData,
  theme: typeof THEMES[string]
) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.secondary };

  // Accent bar at left
  slide.addShape("rect", {
    x: 0, y: 0, w: 0.06, h: SLIDE_H,
    fill: { color: theme.accent },
    line: { width: 0 },
  });

  // Title
  slide.addText(data.title, {
    x: 1.0, y: 1.0, w: 11.3, h: 1.2,
    fontSize: 36, bold: true,
    color: theme.primary,
    fontFace: FONT_NAME,
    align: "left",
    valign: "middle",
  });

  // Divider line
  slide.addShape("rect", {
    x: 1.0, y: 2.3, w: 2, h: 0.04,
    fill: { color: theme.accent },
    line: { width: 0 },
  });

  // Bullets or content
  const bullets = data.bullets || [];
  if (bullets.length > 0) {
    const bulletRows = bullets.map((b) => ({
      text: `  ●  ${b}`,
      options: {
        fontSize: 20,
        color: theme.textOnSecondary,
        fontFace: FONT_NAME,
        bullet: false,
        breakLine: true,
        paraSpaceAfter: 8,
      },
    }));
    slide.addText(bulletRows, {
      x: 1.0, y: 2.8, w: 11.3, h: 4.0,
      valign: "top",
    });
  } else if (data.content) {
    slide.addText(data.content, {
      x: 1.0, y: 2.8, w: 11.3, h: 4.0,
      fontSize: 20,
      color: theme.textOnSecondary,
      fontFace: FONT_NAME,
      valign: "top",
    });
  }
}

function createEndingSlide(
  pptx: PptxGenJS,
  data: SlideData,
  theme: typeof THEMES[string]
) {
  const slide = pptx.addSlide();
  slide.background = { color: theme.bg };

  // Top accent bar
  slide.addShape("rect", {
    x: 0, y: 0, w: SLIDE_W, h: 0.08,
    fill: { color: theme.accent },
    line: { width: 0 },
  });

  // Thank you text
  slide.addText(data.title || "谢谢观看", {
    x: 1.5, y: 2.2, w: 10, h: 2,
    fontSize: 48, bold: true,
    color: theme.textOnPrimary,
    fontFace: FONT_NAME,
    align: "center",
    valign: "middle",
  });

  // Subtitle
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 1.5, y: 4.5, w: 10, h: 1.5,
      fontSize: 24,
      color: theme.accent,
      fontFace: FONT_NAME,
      align: "center",
      valign: "top",
    });
  }

  // Bottom accent bar
  slide.addShape("rect", {
    x: 0, y: SLIDE_H - 0.08, w: SLIDE_W, h: 0.08,
    fill: { color: theme.accent },
    line: { width: 0 },
  });
}

// ─── Main export ───

export async function generatePptx(
  options: PptxGenerateOptions
): Promise<PptxResult> {
  try {
    const { title, author, theme: themeName, outputPath, slides } = options;
    const theme = THEMES[themeName] || THEMES.business;

    log.info("Generating PPTX (native pptxgenjs)", {
      slideCount: slides.length,
      theme: themeName,
      outputPath,
    });

    // Create presentation
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE"; // 16:9
    pptx.author = author || "CourseAI";
    pptx.title = title;

    // Build slides
    for (const slideData of slides) {
      const layout = slideData.layout || "text-only";
      switch (layout) {
        case "cover":
          createCoverSlide(pptx, slideData, theme);
          break;
        case "full-image":
          await createFullImageSlide(pptx, slideData, theme);
          break;
        case "image-left":
          await createImageLeftSlide(pptx, slideData, theme);
          break;
        case "image-top":
          await createImageTopSlide(pptx, slideData, theme);
          break;
        case "text-only":
          createTextOnlySlide(pptx, slideData, theme);
          break;
        case "ending":
          createEndingSlide(pptx, slideData, theme);
          break;
        default:
          createTextOnlySlide(pptx, slideData, theme);
      }
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (outputDir) {
      await fs.mkdir(outputDir, { recursive: true });
    }

    // Write file
    await pptx.writeFile({ fileName: outputPath });

    // Verify file
    const stat = await fs.stat(outputPath);
    log.info("PPTX generated successfully", {
      path: outputPath,
      size: stat.size,
      slideCount: slides.length,
    });

    return {
      success: true,
      outputPath,
      slideCount: slides.length,
      theme: themeName,
      font: FONT_NAME,
    };
  } catch (err: any) {
    log.error("PPTX generation failed", {
      error: err.message,
      stack: err.stack?.substring(0, 500),
    });
    return {
      success: false,
      outputPath: options.outputPath,
      slideCount: 0,
      theme: options.theme,
      font: "",
      error: err.message || "Unknown error",
    };
  }
}
