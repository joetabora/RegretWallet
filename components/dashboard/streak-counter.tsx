"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  streak: number;
  className?: string;
}

export function StreakCounter({ streak, className }: StreakCounterProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Win Streak
        </CardTitle>
        <CardDescription>Consecutive wins</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-orange-500">{streak}</span>
          <span className="text-sm text-muted-foreground">
            {streak === 1 ? "win" : "wins"}
          </span>
        </div>
        {streak > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Keep it going! 🔥
          </p>
        )}
      </CardContent>
    </Card>
  );
}

