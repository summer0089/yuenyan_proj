import React from "react";

export interface StepItem {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 1-based index
  onStepClick?: (stepNumber: number) => void;
  allowClickPrevious?: boolean;
  className?: string;
}
