import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/social/auto-share
 * Generate and share bet outcome automatically
 */
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { betId, platform } = body;

    if (!betId) {
      return NextResponse.json(
        { error: "betId is required" },
        { status: 400 }
      );
    }

    // Get bet with user and charity info
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .select(
        `
        *,
        users:user_id (
          id,
          name,
          email
        ),
        charities:charity_id (
          name
        ),
        anti_charities:anti_charity_id (
          name
        )
      `
      )
      .eq("id", betId)
      .single();

    if (betError || !bet) {
      return NextResponse.json(
        { error: "Bet not found" },
        { status: 404 }
      );
    }

    // Verify user owns the bet
    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (!dbUser || bet.user_id !== dbUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Verify bet is resolved
    if (bet.status !== "won" && bet.status !== "lost") {
      return NextResponse.json(
        { error: "Bet is not resolved" },
        { status: 400 }
      );
    }

    // Return bet data for sharing
    return NextResponse.json({
      bet: {
        id: bet.id,
        title: bet.title,
        amount: parseFloat(bet.amount || "0"),
        status: bet.status,
        charityName: bet.charities?.name || bet.anti_charities?.name,
        antiCharityName: bet.anti_charities?.name,
        userName: bet.users?.name || bet.users?.email || "User",
        resolvedAt: bet.resolved_at,
      },
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/bets/${bet.id}`,
    });
  } catch (error) {
    console.error("Error generating share data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

