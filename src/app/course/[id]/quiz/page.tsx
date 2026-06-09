"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2, ArrowLeft, CheckCircle, XCircle, Clock, Trophy,
  Loader2 as Spinner, Send, RotateCcw, Sparkles
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface QuizQuestion {
  id: string;
  sectionNumber: number;
  sectionTitle: string;
  type: "choice" | "truefalse" | "fillblank";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.course) {
          setCourse(d.course);
          if (d.course.quiz_data && Array.isArray(d.course.quiz_data) && d.course.quiz_data.length > 0) {
            setQuestions(d.course.quiz_data);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  // Timer
  const startTimer = useCallback(() => {
    setStartTime(Date.now());
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimerInterval(interval);
  }, [startTime]);

  const stopTimer = useCallback(() => {
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
  }, [timerInterval]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const generateQuiz = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/generate-quiz`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        toast.success(`已生成 ${data.questions.length} 道测验题`);
      } else {
        toast.error(data.error || "生成失败");
      }
    } catch {
      toast.error("生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId: string, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!submitted) {
      setSubmitted(true);
      stopTimer();
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setElapsedTime(0);
    startTimer();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Group questions by section
  const sections = questions.reduce((acc, q) => {
    const key = `${q.sectionNumber}-${q.sectionTitle}`;
    if (!acc.find((a) => a.key === key)) {
      acc.push({ key, sectionNumber: q.sectionNumber, sectionTitle: q.sectionTitle, questions: [] });
    }
    acc.find((a) => a.key === key)!.questions.push(q);
    return acc;
  }, [] as Array<{ key: string; sectionNumber: number; sectionTitle: string; questions: QuizQuestion[] }>);

  // Score calculation
  const correctCount = submitted
    ? questions.filter((q) => {
        const userAns = answers[q.id] || "";
        return userAns.trim().toLowerCase() === q.answer.trim().toLowerCase();
      }).length
    : 0;
  const totalCount = questions.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Toaster theme="light" position="top-center" />

      <header className="border-b border-neutral-200 glass sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push(`/course/${courseId}`)}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-sm truncate">随堂测验</span>
          {questions.length > 0 && (
            <span className="ml-auto text-xs text-neutral-500">{totalCount} 道题</span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 page-transition">
        {questions.length === 0 ? (
          /* Empty state - generate quiz */
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-float">📝</div>
            <h2 className="text-xl font-bold mb-2">还没有测验题目</h2>
            <p className="text-sm text-neutral-500 mb-8 max-w-md mx-auto">
              AI 会根据课程内容自动生成测验题，涵盖每个章节的知识点
            </p>
            <button
              onClick={generateQuiz}
              disabled={generating}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-gradient-to-r bg-neutral-900 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-sm disabled:opacity-40"
            >
              {generating ? (
                <Spinner className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? "生成中..." : "AI 生成测验题"}
            </button>
          </div>
        ) : (
          <>
            {/* Timer bar */}
            <div className="flex items-center justify-between mb-6 p-3 rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                  <Clock className="w-4 h-4" />
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-neutral-500">
                  {Object.keys(answers).length}/{totalCount} 已答
                </div>
              </div>
              {submitted ? (
                <div className="flex items-center gap-1.5 text-sm">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-medium">{accuracy}% 正确率</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!submitted && Object.keys(answers).length > 0) {
                      handleSubmit();
                    } else if (!submitted) {
                      startTimer();
                    }
                  }}
                  disabled={!submitted && Object.keys(answers).length === 0 && elapsedTime === 0}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                    submitted
                      ? "bg-neutral-100 text-neutral-500"
                      : Object.keys(answers).length > 0
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {submitted ? "已提交" : "提交答案"}
                </button>
              )}
            </div>

            {/* Questions by section */}
            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.key}>
                  <h3 className="text-sm font-medium text-neutral-500 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold">
                      {section.sectionNumber}
                    </div>
                    {section.sectionTitle}
                  </h3>
                  <div className="space-y-4 ml-8">
                    {section.questions.map((q) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        userAnswer={answers[q.id] || ""}
                        submitted={submitted}
                        onAnswer={handleAnswer}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit / Retry buttons */}
            <div className="mt-8 flex justify-center gap-3">
              {!submitted && elapsedTime === 0 && (
                <button
                  onClick={() => startTimer()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r bg-neutral-900 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  开始答题
                </button>
              )}
              {!submitted && Object.keys(answers).length > 0 && (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r bg-neutral-900 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  提交答案 ({Object.keys(answers).length}/{totalCount})
                </button>
              )}
              {submitted && (
                <>
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-200 text-neutral-500 text-sm hover:bg-neutral-50 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重新答题
                  </button>
                  <button
                    onClick={generateQuiz}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-200 text-neutral-500 text-sm hover:bg-neutral-50 transition-all disabled:opacity-40"
                  >
                    {generating ? <Spinner className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    重新生成
                  </button>
                </>
              )}
            </div>

            {/* Results summary */}
            {submitted && (
              <div className="mt-8 p-6 rounded-2xl border border-neutral-200 bg-white text-center">
                <div className="text-4xl mb-2">
                  {accuracy >= 80 ? "🎉" : accuracy >= 60 ? "💪" : "📚"}
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {correctCount}/{totalCount}
                </div>
                <div className="text-sm text-neutral-500">
                  正确率 {accuracy}% · 用时 {formatTime(elapsedTime)}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ─── Question Card Component ─── */
function QuestionCard({
  question,
  userAnswer,
  submitted,
  onAnswer,
}: {
  question: QuizQuestion;
  userAnswer: string;
  submitted: boolean;
  onAnswer: (id: string, value: string) => void;
}) {
  const isCorrect = submitted && userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
  const isAnswered = userAnswer !== "";

  // Type labels
  const typeLabels: Record<string, string> = {
    choice: "单选题",
    truefalse: "判断题",
    fillblank: "填空题",
  };

  return (
    <div className={`rounded-xl border p-4 transition ${
      submitted
        ? isCorrect
          ? "border-emerald-500/30 bg-emerald-500/5"
          : isAnswered
          ? "border-red-500/30 bg-red-500/5"
          : "border-neutral-200 bg-white"
        : "border-neutral-200 bg-white hover:border-neutral-200"
    }`}>
      {/* Question header */}
      <div className="flex items-start gap-2 mb-3">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-medium flex-shrink-0">
          {typeLabels[question.type] || question.type}
        </span>
        <p className="text-sm text-slate-700 leading-relaxed">{question.question}</p>
      </div>

      {/* Choice options */}
      {question.type === "choice" && question.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-4">
          {question.options.map((opt, i) => {
            const isSelected = userAnswer === opt;
            const isThisCorrect = submitted && opt.trim().toLowerCase() === question.answer.trim().toLowerCase();
            return (
              <button
                key={i}
                onClick={() => onAnswer(question.id, opt)}
                disabled={submitted}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition ${
                  submitted
                    ? isThisCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : isSelected
                      ? "border-red-500/40 bg-red-500/10 text-red-400"
                      : "border-neutral-200 text-neutral-500"
                    : isSelected
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                    : "border-neutral-200 text-neutral-500 hover:border-blue-200 hover:bg-neutral-100"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  submitted && isThisCorrect
                    ? "border-emerald-500 bg-emerald-500"
                    : submitted && isSelected
                    ? "border-red-500 bg-red-500"
                    : isSelected
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-300"
                }`}>
                  {(isSelected || (submitted && isThisCorrect)) && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-xs">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* True/False buttons */}
      {question.type === "truefalse" && (
        <div className="flex gap-3 ml-4">
          {["正确", "错误"].map((opt) => {
            const isSelected = userAnswer === opt;
            const isThisCorrect = submitted && opt === question.answer;
            return (
              <button
                key={opt}
                onClick={() => onAnswer(question.id, opt)}
                disabled={submitted}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition ${
                  submitted
                    ? isThisCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : isSelected
                      ? "border-red-500/40 bg-red-500/10 text-red-400"
                      : "border-neutral-200 text-neutral-500"
                    : isSelected
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                    : "border-neutral-200 text-neutral-500 hover:border-blue-200"
                }`}
              >
                {submitted && isThisCorrect && <CheckCircle className="w-4 h-4" />}
                {submitted && isSelected && !isThisCorrect && <XCircle className="w-4 h-4" />}
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Fill in the blank */}
      {question.type === "fillblank" && (
        <div className="ml-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            disabled={submitted}
            placeholder="请输入答案..."
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition ${
              submitted
                ? isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
                  : isAnswered
                  ? "border-red-500/40 bg-red-500/5 text-red-400"
                  : "border-neutral-200 text-neutral-500"
                : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            }`}
          />
        </div>
      )}

      {/* Explanation (after submit) */}
      {submitted && (
        <div className={`mt-3 ml-4 p-3 rounded-lg text-xs leading-relaxed ${
          isCorrect
            ? "bg-emerald-500/5 text-emerald-500"
            : "bg-amber-500/5 text-amber-400/80"
        }`}>
          <div className="flex items-center gap-1.5 font-medium mb-1">
            {isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {isCorrect ? "回答正确" : `正确答案：${question.answer}`}
          </div>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
