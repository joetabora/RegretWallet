import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/leaderboard
 * Fetches public leaderboard with top wins/fails
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "wins"; // 'wins' or 'fails'
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch completed bets with user info
    const { data: bets, error: betsError } = await supabase
      .from("bets")
      .select(
        `
        *,
        users:user_id (
          id,
          clerk_id,
          name,
          email
        ),
        charities:charity_id (
          id,
          name
        ),
        anti_charities:anti_charity_id (
          id,
          name
        )
      `
      )
      .in("status", ["won", "lost"])
      .eq("is_draft", false)
      .order("resolved_at", { ascending: false, nullsFirst: false });

    if (betsError) {
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    // Group by user and calculate stats
    const userStats = new Map<
      string,
      {
        userId: string;
        userName: string;
        userEmail: string;
        wins: number;
        fails: number;
        totalDonated: number;
        totalWon: number;
        lastBetDate?: string;
      }
    >();

    bets?.forEach((bet) => {
      const user = bet.users;
      if (!user) return;

      const userId = user.id;
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          userId,
          userName: user.name || user.email?.split("@")[0] || "Anonymous",
          userEmail: user.email || "",
          wins: 0,
          fails: 0,
          totalDonated: 0,
          totalWon: 0,
        });
      }

      const stats = userStats.get(userId)!;
      const amount = parseFloat(bet.amount || 0);

      if (bet.status === "won") {
        stats.wins++;
        stats.totalWon += amount;
      } else if (bet.status === "lost") {
        stats.fails++;
        stats.totalDonated += parseFloat(bet.donation_amount || bet.amount || 0);
      }

      // Track last bet date
      if (bet.resolved_at && (!stats.lastBetDate || bet.resolved_at > stats.lastBetDate)) {
        stats.lastBetDate = bet.resolved_at;
      }
    });

    // Convert to array and sort
    let leaderboard = Array.from(userStats.values());

    if (type === "wins") {
      leaderboard = leaderboard
        .sort((a, b) => {
          // Sort by wins, then by total won
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.totalWon - a.totalWon;
        })
        .slice(0, limit);
    } else {
      leaderboard = leaderboard
        .sort((a, b) => {
          // Sort by fails, then by total donated
          if (b.fails !== a.fails) return b.fails - a.fails;
          return b.totalDonated - a.totalDonated;
        })
        .slice(0, limit);
    }

    // Add rank
    leaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return NextResponse.json({
      type,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

