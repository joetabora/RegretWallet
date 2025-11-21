"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AntiCharityMarketplace } from "@/components/anti-charity-marketplace";

interface Step5AntiCharityProps {
  value: string;
  onChange: (value: string) => void;
}

export function Step5AntiCharity({ value, onChange }: Step5AntiCharityProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Anti-Charity</h2>
        <p className="text-muted-foreground">
          Pick the "charity" you'd hate to support if you lose your bet
        </p>
      </div>

      <AntiCharityMarketplace
        selectedCharityId={value}
        onSelect={onChange}
      />
    </div>
  );
}

