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
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    isCompleted
                      ? "text-white"
                      : isActive
                      ? "text-white"
                      : ""
                  }`}
                  style={isCompleted
                    ? { background: "oklch(0.35 0 0)" }
                    : isActive
                    ? { background: "oklch(0.35 0 0)", boxShadow: "0 0 0 3px oklch(0 0 0 / 0.06)" }
                    : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }
                  }
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
                  className="mt-1.5 text-[11px] font-medium whitespace-nowrap"
                  style={{ color: isActive ? "oklch(0.35 0 0)" : isCompleted ? "oklch(0.35 0 0)" : "var(--muted-foreground)" }}
                >
                  {labels[i]}
                </span>
                <span
                  className="text-[9px] whitespace-nowrap"
                  style={{ color: isActive ? "oklch(0.35 0 0)" : "var(--muted-foreground)", opacity: isActive ? 1 : 0.6 }}
                >
                  {STEP_TIMES[i]}
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="w-12 sm:w-20 h-px mx-2 mt-[-16px]">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      background: isCompleted
                        ? "oklch(0.35 0 0)"
                        : "var(--border)"
                    }}
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
