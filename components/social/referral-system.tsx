"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Gift, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferralStats {
  code: string;
  totalReferrals: number;
  totalSignups: number;
  totalBets: number;
  rewards: number;
}

export function ReferralSystem({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralStats();
  }, [userId]);

  const fetchReferralStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/referrals/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (stats?.code) {
      const referralUrl = `${window.location.origin}/sign-up?ref=${stats.code}`;
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferral = () => {
    if (stats?.code) {
      const referralUrl = `${window.location.origin}/sign-up?ref=${stats.code}`;
      const text = `Join RegretWallet and make your bets count for charity! Use my referral: ${stats.code}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`;
      window.open(twitterUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Failed to load referral stats</p>
        </CardContent>
      </Card>
    );
  }

  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/sign-up?ref=${stats.code}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Referral Program
        </CardTitle>
        <CardDescription>
          Share RegretWallet and earn rewards when friends sign up
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Code</label>
          <div className="flex gap-2">
            <Input
              value={stats.code}
              readOnly
              className="font-mono font-bold text-lg"
            />
            <Button
              onClick={handleCopyCode}
              variant="outline"
              size="icon"
              className={cn(copied && "bg-green-500 text-white")}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this code with friends to earn rewards
          </p>
        </div>

        {/* Referral URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Referral Link</label>
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              readOnly
              className="text-xs"
            />
            <Button onClick={handleCopyCode} variant="outline" size="sm">
              Copy Link
            </Button>
          </div>
        </div>

        {/* Share Button */}
        <Button
          onClick={shareReferral}
          className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Share on X
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total Signups</p>
            <p className="text-2xl font-bold">{stats.totalSignups}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Referrals</p>
            <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Bets by Referrals</p>
            <p className="text-2xl font-bold">{stats.totalBets}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rewards Earned</p>
            <p className="text-2xl font-bold text-green-600">
              ${stats.rewards.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

