"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step4ProofProps {
  value: "referee" | "honor" | "";
  onChange: (value: "referee" | "honor") => void;
}

export function Step4Proof({ value, onChange }: Step4ProofProps) {
  const isValid = value === "referee" || value === "honor";

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">How Will You Prove It?</h2>
        <p className="text-muted-foreground">
          Choose your proof method for bet resolution
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg",
            value === "honor" && "border-primary border-2 shadow-lg"
          )}
          onClick={() => onChange("honor")}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className={cn(
                "h-8 w-8",
                value === "honor" ? "text-primary" : "text-muted-foreground"
              )} />
              <CardTitle>Honor System</CardTitle>
            </div>
            <CardDescription>
              Trust yourself to be honest about the outcome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Quick and simple</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Self-reported outcome</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Best for personal goals</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg",
            value === "referee" && "border-primary border-2 shadow-lg"
          )}
          onClick={() => onChange("referee")}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className={cn(
                "h-8 w-8",
                value === "referee" ? "text-primary" : "text-muted-foreground"
              )} />
              <CardTitle>Referee Verification</CardTitle>
            </div>
            <CardDescription>
              Have someone verify your achievement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Third-party verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>More credible and trustworthy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Required for larger stakes</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {value && (
        <Card className="border-primary border-2 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-1">Selected Method</p>
            <p className="text-xl font-semibold text-primary">
              {value === "honor" ? "Honor System" : "Referee Verification"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

