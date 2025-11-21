"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreakCounter } from "./streak-counter";
import { Leaderboard } from "./leaderboard";
import { ShareableCard } from "./shareable-card";
import { BetList } from "./bet-list";
import { TrendingUp, TrendingDown, DollarSign, Target, Share2 } from "lucide-react";

interface DashboardStats {
  activeBets: number;
  pendingBets: number;
  wonBets: number;
  lostBets: number;
  totalDonated: number;
  totalWon: number;
  totalLost: number;
  totalActive: number;
  streak: number;
  winRate: number;
  totalBets: number;
}

interface Bet {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: string;
  charityName: string;
  charityId: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionDate?: string;
}

interface DashboardClientProps {
  userName: string;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setBets(data.bets || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const activeBets = bets.filter((b) => b.status === "active");
  const pendingBets = bets.filter((b) => b.status === "pending");
  const wonBets = bets.filter((b) => b.status === "won");
  const lostBets = bets.filter((b) => b.status === "lost");
  const completedBets = [...wonBets, ...lostBets].sort(
    (a, b) =>
      new Date(b.resolvedAt || b.createdAt).getTime() -
      new Date(a.resolvedAt || a.createdAt).getTime()
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.totalActive.toFixed(2)} in escrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wins</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.wonBets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.totalWon.toFixed(2)} won back
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fails</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lostBets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.totalDonated.toFixed(2)} donated
            </p>
          </CardContent>
        </Card>

        <StreakCounter streak={stats.streak} />
      </div>

      {/* Shareable Card Section */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowShareCard(!showShareCard)}>
          <Share2 className="h-4 w-4 mr-2" />
          {showShareCard ? "Hide" : "Share"} Stats
        </Button>
      </div>

      {showShareCard && (
        <ShareableCard
          userName={userName}
          stats={{
            streak: stats.streak,
            wins: stats.wonBets,
            fails: stats.lostBets,
            totalDonated: stats.totalDonated,
            winRate: stats.winRate,
          }}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="active">Active Bets</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          <Link href="/onboarding">
            <Button>Create New Bet</Button>
          </Link>
        </div>

        <TabsContent value="active" className="space-y-4">
          {pendingBets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pending Payment</h3>
              <BetList
                bets={pendingBets}
                emptyMessage="No pending bets"
                emptyAction={{ label: "Create Bet", href: "/onboarding" }}
              />
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active</h3>
            <BetList
              bets={activeBets}
              emptyMessage="You don't have any active bets yet"
              emptyAction={{ label: "Create Your First Bet", href: "/onboarding" }}
            />
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Wins
                </CardTitle>
                <CardDescription>Successfully completed bets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.wonBets}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${stats.totalWon.toFixed(2)} total won
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Fails
                </CardTitle>
                <CardDescription>Failed bets (donated to charity)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.lostBets}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${stats.totalDonated.toFixed(2)} total donated
                </p>
              </CardContent>
            </Card>
          </div>

          <BetList
            bets={completedBets}
            emptyMessage="You haven't completed any bets yet"
            emptyAction={{ label: "Create Bet", href: "/onboarding" }}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

