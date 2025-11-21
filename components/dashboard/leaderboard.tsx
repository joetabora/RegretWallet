"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingDown, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  wins: number;
  fails: number;
  totalDonated: number;
  totalWon: number;
  lastBetDate?: string;
}

interface LeaderboardProps {
  className?: string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
  return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
};

export function Leaderboard({ className }: LeaderboardProps) {
  const [type, setType] = useState<"wins" | "fails">("wins");
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?type=${type}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Public Leaderboard
        </CardTitle>
        <CardDescription>Top performers on RegretWallet</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={type} onValueChange={(v) => setType(v as "wins" | "fails")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wins">Top Wins</TabsTrigger>
            <TabsTrigger value="fails">Top Fails</TabsTrigger>
          </TabsList>

          <TabsContent value="wins" className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No winners yet. Be the first!
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      entry.rank <= 3 && "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.wins} {entry.wins === 1 ? "win" : "wins"} • ${entry.totalWon.toFixed(2)} won
                        </p>
                      </div>
                    </div>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="fails" className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No failures yet.
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      entry.rank <= 3 && "bg-gradient-to-r from-red-500/5 to-orange-500/10 border-red-500/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.fails} {entry.fails === 1 ? "fail" : "fails"} • ${entry.totalDonated.toFixed(2)} donated
                        </p>
                      </div>
                    </div>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

