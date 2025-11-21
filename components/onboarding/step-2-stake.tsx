"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2StakeProps {
  value: number;
  onChange: (value: number) => void;
}

const stakePresets = [50, 100, 250, 500, 1000, 2500, 5000];

export function Step2Stake({ value, onChange }: Step2StakeProps) {
  const [customAmount, setCustomAmount] = useState(
    value && !stakePresets.includes(value) ? value.toString() : ""
  );
  const [error, setError] = useState("");

  const handlePresetSelect = (amount: number) => {
    setCustomAmount("");
    setError("");
    onChange(amount);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCustomAmount(inputValue);

    if (!inputValue) {
      setError("");
      return;
    }

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setError("Please enter a valid number");
      return;
    }

    if (numValue < 50) {
      setError("Minimum stake is $50");
      return;
    }

    if (numValue > 5000) {
      setError("Maximum stake is $5,000");
      return;
    }

    setError("");
    onChange(numValue);
  };

  const isValid = value >= 50 && value <= 5000;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">What's Your Stake?</h2>
        <p className="text-muted-foreground">
          Choose how much you're willing to bet ({`$${(50).toLocaleString()} - $${(5000).toLocaleString()}`})
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Select Your Stake Amount
          </CardTitle>
          <CardDescription>
            This amount will be held in escrow. If you lose, it goes to charity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-4 block">Quick Select</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {stakePresets.map((amount) => (
                <Button
                  key={amount}
                  variant={value === amount ? "default" : "outline"}
                  className={cn(
                    "h-16 text-lg font-semibold",
                    value === amount && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handlePresetSelect(amount)}
                >
                  {`$${amount.toLocaleString()}`}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground text-lg">$</span>
            </div>
            <Label htmlFor="custom-stake" className="mb-2 block">
              Or Enter Custom Amount
            </Label>
            <Input
              id="custom-stake"
              type="number"
              min="50"
              max="5000"
              step="1"
              placeholder="500"
              value={customAmount}
              onChange={handleCustomChange}
              className="text-lg pl-8 h-14"
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
            {!error && customAmount && isValid && (
              <p className="text-sm text-muted-foreground mt-1">
                Stake: ${parseFloat(customAmount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>

          {value > 0 && isValid && (
            <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Selected Stake</p>
              <p className="text-2xl font-bold text-primary">
                ${value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

