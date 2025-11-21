import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/challenges
 * Get all group challenges
 */
export async function GET() {
  try {
    // Get challenges
    const { data: challenges, error } = await supabase
      .from("group_challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch challenges" },
        { status: 500 }
      );
    }

    // Get detailed stats for each challenge
    const challengesWithStats = await Promise.all(
      (challenges || []).map(async (challenge) => {
        const { count: participants } = await supabase
          .from("challenge_participants")
          .select("*", { count: "exact", head: true })
          .eq("challenge_id", challenge.id);

        const { count: bets } = await supabase
          .from("challenge_bets")
          .select("*", { count: "exact", head: true })
          .eq("challenge_id", challenge.id);

        // Get bet IDs for this challenge
        const { data: challengeBets } = await supabase
          .from("challenge_bets")
          .select("bet_id")
          .eq("challenge_id", challenge.id);

        // Get donation amounts from bets
        let totalDonated = 0;
        if (challengeBets && challengeBets.length > 0) {
          const betIds = challengeBets.map((cb: any) => cb.bet_id);
          const { data: betData } = await supabase
            .from("bets")
            .select("donation_amount, amount")
            .in("id", betIds)
            .eq("status", "lost");

          totalDonated =
            betData?.reduce((sum: number, bet: any) => {
              return sum + parseFloat(bet.donation_amount || bet.amount || "0");
            }, 0) || 0;
        }

        return {
          ...challenge,
          participants: participants || 0,
          total_bets: bets || 0,
          total_donated: totalDonated,
        };
      })
    );

    return NextResponse.json({
      challenges: challengesWithStats,
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/challenges
 * Create a new group challenge
 */
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, goal, target_amount, duration_weeks } = body;

    if (!name || !goal || !target_amount || !duration_weeks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(duration_weeks) * 7);

    // Create challenge
    const { data: challenge, error: createError } = await supabase
      .from("group_challenges")
      .insert({
        name,
        description: description || null,
        goal,
        target_amount: parseFloat(target_amount),
        duration_weeks: parseInt(duration_weeks),
        created_by: dbUser.id,
        end_date: endDate.toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (createError || !challenge) {
      return NextResponse.json(
        { error: "Failed to create challenge" },
        { status: 500 }
      );
    }

    // Add creator as participant
    await supabase.from("challenge_participants").insert({
      challenge_id: challenge.id,
      user_id: dbUser.id,
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

