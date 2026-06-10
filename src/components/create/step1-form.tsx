"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2, Sparkles, BookTemplate, ChevronDown, ChevronUp, Plus, X, Calculator, ScrollText, Languages, Leaf, Atom, FlaskConical, Globe2, Landmark, Code2, Music, Palette, SquareFunction } from "lucide-react";
import { ICON_MAP } from "@/components/subject-icon";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Step1FormProps {
  onCreated: (courseId: string) => void;
}

interface OutlineItem {
  id: string;
  text: string;
  knowledgePoints: string;
  expanded: boolean;
}

const QUICK_TEMPLATES = [
  { id: "math", icon: "Calculator", name: "数学", title: "二次函数的图像与性质", subject: "math", grade: "高中", items: ["二次函数的定义与标准形式", "抛物线的开口方向与顶点坐标", "对称轴的求法与应用", "二次函数的最值问题", "实际应用：抛物线运动与面积优化"] },
  { id: "chinese", icon: "ScrollText", name: "语文", title: "唐宋八大家之苏轼", subject: "chinese", grade: "高中", items: ["苏轼的生平与时代背景", "《水调歌头》赏析", "《赤壁赋》的思想内涵", "苏轼的诗词风格与文学地位", "东坡精神对后世的深远影响"] },
  { id: "english", icon: "Languages", name: "英语", title: "英语时态完全攻略", subject: "english", grade: "高中", items: ["一般现在时与现在进行时的区别", "一般过去时与现在完成时", "过去完成时与过去进行时", "将来时态：will/shall/be going to", "时态在复杂句中的应用"] },
  { id: "physics", icon: "Atom", name: "物理", title: "牛顿三大运动定律", subject: "physics", grade: "高中", items: ["第一定律：惯性定律", "第二定律：F=ma", "第三定律：作用力与反作用力", "牛顿定律在日常生活中的应用", "经典力学的局限性与爱因斯坦相对论"] },
  { id: "chemistry", icon: "FlaskConical", name: "化学", title: "化学键与分子结构", subject: "chemistry", grade: "高中", items: ["离子键的形成与特征", "共价键：极性与非极性", "金属键与金属晶体", "分子间作用力", "分子结构对物质性质的影响"] },
  { id: "biology", icon: "Leaf", name: "生物", title: "光合作用的原理与过程", subject: "biology", grade: "高中", items: ["光合作用的发现历史", "叶绿体的结构与光合色素", "光反应：水的光解与ATP合成", "暗反应：CO₂的固定与C₃还原", "影响光合作用的因素与农业应用"] },
  { id: "history", icon: "Landmark", name: "历史", title: "中国近代史大事记", subject: "history", grade: "高中", items: ["鸦片战争与不平等条约", "太平天国运动", "洋务运动与戊戌变法", "辛亥革命与民国建立", "五四运动与新文化运动"] },
  { id: "programming", icon: "Code2", name: "编程", title: "Python编程入门：变量与数据类型", subject: "programming", grade: "大学", items: ["Python环境安装与第一个程序", "变量命名规则与赋值", "基本数据类型：整数、浮点、字符串、布尔", "类型转换与字符串操作", "输入输出与简单计算程序"] },
];

const SUBJECT_GRID = [
  { value: "math", label: "数学", icon: "Calculator" },
  { value: "chinese", label: "语文", icon: "ScrollText" },
  { value: "english", label: "英语", icon: "Languages" },
  { value: "biology", label: "生物", icon: "Leaf" },
  { value: "physics", label: "物理", icon: "Atom" },
  { value: "chemistry", label: "化学", icon: "FlaskConical" },
  { value: "geography", label: "地理", icon: "Globe2" },
  { value: "history", label: "历史", icon: "Landmark" },
  { value: "programming", label: "编程", icon: "Code2" },
  { value: "music", label: "音乐", icon: "Music" },
  { value: "art", label: "美术", icon: "Palette" },
  { value: "general", label: "通用", icon: "SquareFunction" },
];

const SUBJECT_GRADES: Record<string, string> = {
  physics: "高中", chemistry: "高中", biology: "高中",
  math: "高中", chinese: "高中", english: "高中",
  programming: "大学", history: "高中",
};

export default function Step1Form({ onCreated }: Step1FormProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("general");
  const [grade, setGrade] = useState("");
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);
  const [loading, setLoading] = useState(false);

  const applyTemplate = (t: typeof QUICK_TEMPLATES[0]) => {
    setTitle(t.title);
    setSubject(t.subject);
    setGrade(t.grade);
    setOutlineItems(t.items.map((text, idx) => ({ id: `item-${idx}`, text, knowledgePoints: "", expanded: false })));
    toast.success(`已应用「${t.name}」模板`);
  };

  const handleSubjectSelect = (val: string) => {
    setSubject(val);
    const preferred = SUBJECT_GRADES[val];
    if (preferred) setGrade(preferred);
  };

  const addOutlineItem = () => {
    setOutlineItems((prev) => [...prev, { id: `item-${Date.now()}`, text: "", knowledgePoints: "", expanded: false }]);
  };

  const removeOutlineItem = (id: string) => {
    setOutlineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, text: string) => {
    setOutlineItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const updateKP = (id: string, knowledgePoints: string) => {
    setOutlineItems((prev) => prev.map((item) => (item.id === id ? { ...item, knowledgePoints } : item)));
  };

  const toggleExpand = (id: string) => {
    setOutlineItems((prev) => prev.map((item) => (item.id === id ? { ...item, expanded: !item.expanded } : item)));
  };

  const moveItem = (id: string, dir: "up" | "down") => {
    const idx = outlineItems.findIndex((item) => item.id === id);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === outlineItems.length - 1)) return;
    const newItems = [...outlineItems];
    [newItems[idx], newItems[idx + (dir === "up" ? -1 : 1)]] = [newItems[idx + (dir === "up" ? -1 : 1)], newItems[idx]];
    setOutlineItems(newItems);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("请输入课程标题"); return; }
    if (title.trim().length > 100) { toast.error("课程标题不能超过100个字符"); return; }
    setLoading(true);
    try {
      const outline = outlineItems.map((item, i) => `${i + 1}. ${item.text}`).join("\n");
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), subject, grade, outline }),
      });
      const data = await res.json();
      if (res.ok && data.course?.id) {
        toast.success("课程已创建");
        onCreated(data.course.id);
      } else {
        const d = data.error || "创建失败";
        toast.error(d);
      }
    } catch { toast.error("保存失败"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 page-transition">
      <div className="animate-fade-up">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <BookTemplate className="w-5 h-5 text-primary-400" /> 输入课程信息
        </h2>
        <p className="text-sm text-neutral-500">选择学科、输入课程主题和教学大纲</p>
      </div>

      <div className="animate-fade-up-delay-1">
        <label className="text-xs font-medium text-neutral-500 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> 快速模板
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_TEMPLATES.map((t) => (
            <button key={t.id} type="button" onClick={() => applyTemplate(t)}
              className="group flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-200 transition-all text-left">
              <span className="flex-shrink-0">{(() => { const I = ICON_MAP[t.icon]; return I ? <I className="w-5 h-5 text-primary-400" /> : null; })()}</span>
              <div className="min-w-0">
                <div className="text-xs font-medium text-neutral-600 group-hover:text-primary-600 transition truncate">{t.name}</div>
                <div className="text-[10px] text-neutral-400 truncate mt-0.5">{t.title}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5 animate-fade-up-delay-2">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-neutral-500">课程标题 *</label>
            <span className={`text-[10px] ${title.length > 100 ? "text-red-400" : title.length > 80 ? "text-amber-400" : "text-neutral-400"}`}>{title.length}/100</span>
          </div>
          <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：光合作用原理详解" maxLength={100}
            className={!title.trim() ? "border-red-500/40" : ""} />
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-500 mb-2.5 block">选择学科</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {SUBJECT_GRID.map((s) => (
              <button key={s.value} type="button" onClick={() => handleSubjectSelect(s.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${subject === s.value ? "border-primary-500/40 bg-primary-500/10 text-primary-400 shadow-lg shadow-md" : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300"}`}>
                {(() => { const I = ICON_MAP[s.icon]; return I ? <I className="w-5 h-5" /> : null; })()}
                <span className="text-[10px] font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-500 mb-2.5 block">年级</label>
          <div className="flex flex-wrap items-center gap-2">
            {["", "小学", "初中", "高中", "大学", "成人教育"].map((g) => (
              <button key={g || "all"} type="button" onClick={() => setGrade(g)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${grade === g ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-50"}`}>
                {g || "不限"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-medium text-neutral-500">课程大纲（可选）</label>
            <button type="button" onClick={addOutlineItem} className="flex items-center gap-1 text-[10px] text-primary-400 hover:text-primary-600 transition">
              <Plus className="w-3 h-3" /> 添加
            </button>
          </div>
          {outlineItems.length === 0 ? (
            <textarea value="" onChange={(e) => {
              const lines = e.target.value.split("\n").filter(Boolean);
              if (lines.length > 1) {
                setOutlineItems(lines.map((text, idx) => ({ id: `item-${idx}`, text: text.replace(/^\d+\.\s*/, ""), knowledgePoints: "", expanded: false })));
              }
            }} placeholder="输入大纲要点，每行一条（如：1. 光合作用原理 2. 叶绿体结构...）" rows={4}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/40 transition-all resize-none" />
          ) : (
            <div className="space-y-2">
              {outlineItems.map((item, idx) => (
                <div key={item.id} className={`rounded-xl border transition-all ${item.expanded ? "border-primary-500/20 bg-neutral-100" : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"}`}>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <div className="flex flex-col gap-0.5 opacity-30">
                      <button type="button" onClick={() => moveItem(item.id, "up")} disabled={idx === 0} className="p-0.5 hover:opacity-100 disabled:opacity-10 transition"><ChevronUp className="w-3 h-3" /></button>
                      <button type="button" onClick={() => moveItem(item.id, "down")} disabled={idx === outlineItems.length - 1} className="p-0.5 hover:opacity-100 disabled:opacity-10 transition"><ChevronDown className="w-3 h-3" /></button>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 w-4 text-center flex-shrink-0">{idx + 1}</span>
                    <input type="text" value={item.text} onChange={(e) => updateItem(item.id, e.target.value)} placeholder="大纲要点..."
                      className="flex-1 bg-transparent text-sm text-neutral-600 placeholder:text-neutral-300 focus:outline-none min-w-0" />
                    <button type="button" onClick={() => toggleExpand(item.id)} className={`p-1 rounded-md transition text-xs ${item.expanded ? "text-primary-400 bg-primary-500/10" : "text-neutral-400 hover:text-neutral-500"}`} title="展开知识点">
                      {item.expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button type="button" onClick={() => removeOutlineItem(item.id)} className="p-1 rounded-md text-neutral-300 hover:text-red-400 transition"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${item.expanded ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-3 pb-3 pl-9">
                      <textarea value={item.knowledgePoints} onChange={(e) => updateKP(item.id, e.target.value)} placeholder="补充知识点（可选）" rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-100 text-xs text-neutral-500 placeholder:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary-500/20 resize-none" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addOutlineItem} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-neutral-300 text-neutral-400 hover:text-neutral-500 hover:border-neutral-300 transition text-xs">
                <Plus className="w-3 h-3" /> 添加大纲项
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end animate-fade-up-delay-3">
        <Button onClick={handleSubmit} disabled={loading || !title.trim()}>
          {loading ? "保存中..." : "下一步：生成教学文案"}
        </Button>
      </div>
    </div>
  );
}
