"use client";

import { useState, useEffect } from "react";
import { SocialShareCard } from "./social-share-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

interface BetShareCardProps {
  betId: string;
  className?: string;
}

export function BetShareCard({ betId, className }: BetShareCardProps) {
  const [betData, setBetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchBetData = async () => {
      if (!betId || !showShare) return;

      setLoading(true);
      try {
        const response = await fetch("/api/social/auto-share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ betId }),
        });

        if (response.ok) {
          const data = await response.json();
          setBetData(data.bet);
        }
      } catch (error) {
        console.error("Error fetching bet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBetData();
  }, [betId, showShare]);

  if (!showShare) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Bet Result
          </CardTitle>
          <CardDescription>
            Share your bet outcome on social media
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setShowShare(true)}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Generate Share Card
          </button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!betData || (betData.status !== "won" && betData.status !== "lost")) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            Bet must be resolved (won or lost) to share
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <SocialShareCard bet={betData} onShare={(platform) => {
        console.log(`Shared to ${platform}`);
      }} />
    </div>
  );
}

