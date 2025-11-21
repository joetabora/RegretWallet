"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step3DurationProps {
  value: number;
  onChange: (value: number) => void;
}

const durationOptions = [
  { weeks: 4, label: "1 Month", description: "4 weeks" },
  { weeks: 8, label: "2 Months", description: "8 weeks" },
  { weeks: 12, label: "3 Months", description: "12 weeks" },
  { weeks: 16, label: "4 Months", description: "16 weeks" },
  { weeks: 26, label: "6 Months", description: "26 weeks" },
  { weeks: 52, label: "1 Year", description: "52 weeks" },
];

export function Step3Duration({ value, onChange }: Step3DurationProps) {
  const calculateEndDate = (weeks: number) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + weeks * 7);
    return endDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isValid = value >= 4 && value <= 52;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">How Long Do You Have?</h2>
        <p className="text-muted-foreground">
          Choose your bet duration (4 - 52 weeks)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Duration
          </CardTitle>
          <CardDescription>
            When should this bet be resolved?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {durationOptions.map((option) => (
              <Button
                key={option.weeks}
                variant={value === option.weeks ? "default" : "outline"}
                className={cn(
                  "h-auto p-4 flex flex-col items-start",
                  value === option.weeks && "bg-primary text-primary-foreground"
                )}
                onClick={() => onChange(option.weeks)}
              >
                <span className="text-lg font-semibold mb-1">{option.label}</span>
                <span className="text-sm opacity-90">{option.description}</span>
                <span className="text-xs mt-2 opacity-75">
                  Ends: {calculateEndDate(option.weeks)}
                </span>
              </Button>
            ))}
          </div>

          {value > 0 && isValid && (
            <div className="mt-6 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Selected Duration</p>
              <p className="text-2xl font-bold text-primary mb-1">
                {durationOptions.find((opt) => opt.weeks === value)?.label || `${value} weeks`}
              </p>
              <p className="text-sm text-muted-foreground">
                Bet ends on {calculateEndDate(value)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

