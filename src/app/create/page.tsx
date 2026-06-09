"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Settings } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { StepBar } from "@/components/step-bar";
import Step1 from "@/components/create/step1";
import Step2 from "@/components/create/step2";
import Step3 from "@/components/create/step3";
import Step4 from "@/components/create/step4";
import Step5 from "@/components/create/step5";

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-500 rounded-full animate-spin" />
        </div>
      }
    >
      <CreatePageInner />
    </Suspense>
  );
}

function CreatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const step = parseInt(searchParams.get("step") || "1", 10);

  const steps = ["step1", "step2", "step3", "step4", "step5"];
  const labels = ["课程信息", "教学文案", "配图", "PPT 样式", "导出 PPTX"];

  const handleStepChange = async (newStep: number) => {
    if (!courseId) return;

    // Check course status to determine max accessible step
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) return;
      const data = await res.json();
      const course = data.course;
      // Use progress_step first (more granular), then fall back to status
      const stepMap: Record<string, number> = {
        'draft': 1,
        'created': 1,
        'generating': 1,
        'generating_script': 1,
        'script_ready': 3,
        'generating_images': 2,
        'images_ready': 4,
        'style_ready': 5,
        'generating_pptx': 4,
        'pptx_ready': 5,
        'voice_ready': 5,
        'completed': 5,
        'error': 1,
      };
      const maxStep = stepMap[course?.progress_step] || stepMap[course?.status] || 1;

      // Only allow jumping to completed steps or the next one
      if (newStep > maxStep + 1) {
        toast.error("请先完成前面的步骤");
        return;
      }
    } catch {
      // on error, allow navigation
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(newStep));
    router.push(`/create?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Toaster theme="light" position="top-center" />

      {/* Top nav */}
      <header className="border-b border-neutral-200 glass sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-[10px]">
              C
            </div>
          </button>
          <div className="h-5 w-px bg-neutral-100" />
          <span className="font-semibold text-sm">课程创作</span>
          <div className="ml-auto">
            <Link href="/settings" className="text-neutral-500 hover:text-neutral-600 transition">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {courseId ? (
          <>
            <div className="mb-8">
              <StepBar currentStep={step} steps={steps} labels={labels} />
            </div>
            <StepContent
              courseId={courseId}
              step={step}
              onStepChange={handleStepChange}
            />
          </>
        ) : (
          <CreateForm onCreated={(id) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("courseId", id);
            params.set("step", "1");
            router.push(`/create?${params.toString()}`);
          }} />
        )}
      </main>
    </div>
  );
}

/* ─── Step1: Create course form (no courseId yet) ─── */
import Step1Form from "@/components/create/step1-form";

function CreateForm({ onCreated }: { onCreated: (id: string) => void }) {
  return <Step1Form onCreated={onCreated} />;
}

/* ─── Step Content Router ─── */
function StepContent({
  courseId,
  step,
  onStepChange,
}: {
  courseId: string;
  step: number;
  onStepChange: (s: number) => void;
}) {
  return (
    <div key={step} className="page-transition">
      {step === 1 && <Step1 courseId={courseId} onNext={() => onStepChange(2)} />}
      {step === 2 && (
        <Step2
          courseId={courseId}
          onNext={() => onStepChange(3)}
          onPrev={() => onStepChange(1)}
        />
      )}
      {step === 3 && (
        <Step3
          courseId={courseId}
          onNext={() => onStepChange(4)}
          onPrev={() => onStepChange(2)}
        />
      )}
      {step === 4 && (
        <Step4
          courseId={courseId}
          onNext={() => onStepChange(5)}
          onPrev={() => onStepChange(3)}
        />
      )}
      {step === 5 && (
        <Step5
          courseId={courseId}
          onNext={() => onStepChange(5)}
          onPrev={() => onStepChange(4)}
        />
      )}
    </div>
  );
}
