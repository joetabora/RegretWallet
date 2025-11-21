"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "./progress-bar";
import { Step1Goal } from "./step-1-goal";
import { Step2Stake } from "./step-2-stake";
import { Step3Duration } from "./step-3-duration";
import { Step4Proof } from "./step-4-proof";
import { Step5AntiCharity } from "./step-5-anti-charity";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 5;

interface WizardData {
  step1: {
    goal: string;
    description: string;
    templateId?: string;
  };
  step2: number; // stake amount
  step3: number; // duration in weeks
  step4: "referee" | "honor" | ""; // proof method
  step5: string; // anti-charity id
}

interface OnboardingWizardProps {
  userId: string;
}

export function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData>({
    step1: { goal: "", description: "" },
    step2: 0,
    step3: 0,
    step4: "",
    step5: "",
  });

  // Save draft on data change
  useEffect(() => {
    const saveDraft = async () => {
      if (!hasValidDataForCurrentStep()) return;

      setIsSaving(true);
      try {
        const response = await fetch("/api/bets/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftId,
            userId,
            step: currentStep,
            data: wizardData,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.draftId && !draftId) {
            setDraftId(result.draftId);
          }
        }
      } catch (error) {
        console.error("Error saving draft:", error);
      } finally {
        setIsSaving(false);
      }
    };

    const debounceTimer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(debounceTimer);
  }, [wizardData, currentStep, draftId, userId]);

  const hasValidDataForCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return wizardData.step1.goal.trim().length >= 10;
      case 2:
        return wizardData.step2 >= 50 && wizardData.step2 <= 5000;
      case 3:
        return wizardData.step3 >= 4 && wizardData.step3 <= 52;
      case 4:
        return wizardData.step4 === "referee" || wizardData.step4 === "honor";
      case 5:
        return !!wizardData.step5;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!hasValidDataForCurrentStep()) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async () => {
    if (!hasValidDataForCurrentStep()) return;

    try {
      const response = await fetch("/api/bets/create-from-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          userId,
          data: wizardData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/bets/${result.betId}`);
      } else {
        console.error("Failed to create bet");
      }
    } catch (error) {
      console.error("Error creating bet:", error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Goal
            value={wizardData.step1}
            onChange={(value) =>
              setWizardData({ ...wizardData, step1: value })
            }
          />
        );
      case 2:
        return (
          <Step2Stake
            value={wizardData.step2}
            onChange={(value) =>
              setWizardData({ ...wizardData, step2: value })
            }
          />
        );
      case 3:
        return (
          <Step3Duration
            value={wizardData.step3}
            onChange={(value) =>
              setWizardData({ ...wizardData, step3: value })
            }
          />
        );
      case 4:
        return (
          <Step4Proof
            value={wizardData.step4}
            onChange={(value) =>
              setWizardData({ ...wizardData, step4: value })
            }
          />
        );
      case 5:
        return (
          <Step5AntiCharity
            value={wizardData.step5}
            onChange={(value) =>
              setWizardData({ ...wizardData, step5: value })
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create Your Bet
        </h1>
        <p className="text-muted-foreground">
          Follow these steps to set up your bet with RegretWallet
        </p>
      </div>

      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <Card className="min-h-[500px]">
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {isSaving && (
          <span className="text-sm text-muted-foreground">
            Saving draft...
          </span>
        )}

        {currentStep < TOTAL_STEPS ? (
          <Button
            onClick={handleNext}
            disabled={!hasValidDataForCurrentStep()}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!hasValidDataForCurrentStep()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Check className="h-4 w-4" />
            Complete Bet
          </Button>
        )}
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 pt-4 flex-wrap">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = 
            (wizardData.step1.goal && stepNum === 1) ||
            (wizardData.step2 > 0 && stepNum === 2) ||
            (wizardData.step3 > 0 && stepNum === 3) ||
            (wizardData.step4 && stepNum === 4) ||
            (wizardData.step5 && stepNum === 5);
          const isCurrent = stepNum === currentStep;

          return (
            <button
              key={stepNum}
              onClick={() => setCurrentStep(stepNum)}
              className={cn(
                "h-2 rounded-full transition-all",
                "w-8 sm:w-8",
                isCurrent && "bg-primary w-12",
                !isCurrent && isCompleted && "bg-primary/50",
                !isCurrent && !isCompleted && "bg-muted"
              )}
              aria-label={`Step ${stepNum}`}
            />
          );
        })}
      </div>
    </div>
  );
}

