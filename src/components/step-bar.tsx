"use client";

import { Check, Loader2 } from "lucide-react";

interface StepBarProps {
  currentStep: number;
  steps: string[];
  labels: string[];
}

const STEP_TIMES = ["~30s", "~10s", "~60s", "~10s", "~30s"];

export function StepBar({ currentStep, steps, labels }: StepBarProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center min-w-max">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={step} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                    isActive ? "text-blue-400" : isCompleted ? "text-emerald-500" : "text-slate-400"
                  }`}
                >
                  {labels[i]}
                </span>
                <span
                  className={`text-[9px] whitespace-nowrap ${
                    isActive ? "text-blue-400" : "text-slate-300"
                  }`}
                >
                  {STEP_TIMES[i]}
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="w-12 sm:w-20 h-px mx-2 mt-[-16px]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted
                        ? "bg-gradient-to-r from-blue-400 to-blue-200"
                        : "bg-slate-100"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
