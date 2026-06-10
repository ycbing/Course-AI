"use client";

import { LucideIcon, Calculator, ScrollText, Languages, Leaf, Atom, FlaskConical, Globe2, Landmark, Code2, Music, Palette, SquareFunction, BookOpen, Presentation, PenTool, Link2, Target } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Calculator,
  ScrollText,
  Languages,
  Leaf,
  Atom,
  FlaskConical,
  Globe2,
  Landmark,
  Code2,
  Music,
  Palette,
  SquareFunction,
  // Aliases for emoji-based names
  math: Calculator,
  chinese: ScrollText,
  english: Languages,
  biology: Leaf,
  physics: Atom,
  chemistry: FlaskConical,
  geography: Globe2,
  history: Landmark,
  programming: Code2,
  music: Music,
  art: Palette,
  general: SquareFunction,
  // Extra mappings
  BookOpen,
  Presentation,
  PenTool,
  Link2,
  Target,
};

export { ICON_MAP };

export function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || SquareFunction;
  return <Icon className={className || "w-5 h-5"} />;
}
