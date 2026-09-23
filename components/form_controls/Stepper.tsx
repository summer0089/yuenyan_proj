import React from "react";
import { Check } from "lucide-react";
import { StepperProps } from "@/utils/types/stepper_props";

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  allowClickPrevious = false,
  className = "",
}: StepperProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <ol className="flex items-start w-full list-none p-0 m-0">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable =
            allowClickPrevious && isCompleted && typeof onStepClick === "function";
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.title}
              className="flex-1 relative flex flex-col items-center"
            >
              {/* Connecting divider line to next step */}
              {!isLast && (
                <div
                  className="absolute top-4 sm:top-5 left-1/2 w-full h-[2.5px] -translate-y-1/2 z-0"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      stepNumber < currentStep ? "bg-primary" : "bg-slate-200"
                    }`}
                  />
                </div>
              )}

              {/* Step Button / Container */}
              <div
                className={`relative z-10 flex flex-col items-center text-center ${
                  isClickable ? "cursor-pointer group" : ""
                }`}
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(stepNumber);
                  }
                }}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && onStepClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onStepClick(stepNumber);
                  }
                }}
              >
                {/* Step Circle Badge */}
                <div className="rounded-full bg-white p-0.5">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 ${
                      isCompleted
                        ? "bg-primary text-white shadow-sm ring-4 ring-primary/10"
                        : isCurrent
                        ? "bg-white border-2 border-primary text-primary shadow-md ring-4 ring-primary/20 scale-105"
                        : "bg-white border-2 border-slate-300 text-slate-400"
                    }`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-3" />
                    ) : step.icon ? (
                      <span className="w-4 h-4 flex items-center justify-center">
                        {step.icon}
                      </span>
                    ) : (
                      <span>{stepNumber}</span>
                    )}
                  </div>
                </div>

                {/* Step Labels */}
                <div className="mt-2 flex flex-col items-center px-1">
                  <span
                    className={`text-[11px] sm:text-xs font-bold leading-tight transition-colors ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-slate-800 group-hover:text-primary"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span
                      className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 hidden sm:block ${
                        isCurrent
                          ? "text-slate-500 font-medium"
                          : isCompleted
                          ? "text-slate-400"
                          : "text-slate-400/80"
                      }`}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
