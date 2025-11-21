import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/dashboard/stats
 * Fetches user dashboard statistics
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from Supabase
    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError || !dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch all bets for user with charity info
    const { data: bets, error: betsError } = await supabase
      .from("bets")
      .select(
        `
        *,
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
      .eq("user_id", dbUser.id)
      .eq("is_draft", false)
      .order("created_at", { ascending: false });

    if (betsError) {
      return NextResponse.json(
        { error: "Failed to fetch bets" },
        { status: 500 }
      );
    }

    // Calculate statistics
    const activeBets = bets?.filter((b) => b.status === "active") || [];
    const pendingBets = bets?.filter((b) => b.status === "pending") || [];
    const wonBets = bets?.filter((b) => b.status === "won") || [];
    const lostBets = bets?.filter((b) => b.status === "lost") || [];
    const completedBets = bets?.filter((b) => b.status === "won" || b.status === "lost") || [];

    const totalDonated =
      lostBets.reduce((sum, bet) => sum + parseFloat(bet.donation_amount || bet.amount || 0), 0) || 0;
    const totalWon =
      wonBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0) || 0;
    const totalLost =
      lostBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0) || 0;
    const totalActive =
      activeBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0) || 0;

    // Calculate streak (consecutive won bets)
    let streak = 0;
    const sortedCompleted = [...completedBets].sort(
      (a, b) =>
        new Date(b.resolved_at || b.created_at).getTime() -
        new Date(a.resolved_at || a.created_at).getTime()
    );

    for (const bet of sortedCompleted) {
      if (bet.status === "won") {
        streak++;
      } else {
        break;
      }
    }

    // Calculate win rate
    const winRate =
      completedBets.length > 0
        ? (wonBets.length / completedBets.length) * 100
        : 0;

    return NextResponse.json({
      stats: {
        activeBets: activeBets.length,
        pendingBets: pendingBets.length,
        wonBets: wonBets.length,
        lostBets: lostBets.length,
        totalDonated,
        totalWon,
        totalLost,
        totalActive,
        streak,
        winRate: Math.round(winRate * 100) / 100,
        totalBets: bets?.length || 0,
      },
      bets: bets?.map((bet) => ({
        id: bet.id,
        title: bet.title,
        description: bet.description,
        amount: parseFloat(bet.amount || 0),
        status: bet.status,
        charityName: bet.charities?.name || bet.anti_charities?.name || "Unknown",
        charityId: bet.charity_id || bet.anti_charity_id,
        createdAt: bet.created_at,
        resolvedAt: bet.resolved_at,
        resolutionDate: bet.resolution_date,
      })) || [],
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

