import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/referrals/stats
 * Get user's referral stats
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get or create referral code
    let { data: referral, error: refError } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", dbUser.id)
      .single();

    if (refError && refError.code === "PGRST116") {
      // Create referral code
      const { data: newReferral, error: createError } = await supabase
        .from("referrals")
        .insert({
          referrer_id: dbUser.id,
          referral_code: await generateUniqueCode(),
        })
        .select()
        .single();

      if (createError || !newReferral) {
        return NextResponse.json(
          { error: "Failed to create referral code" },
          { status: 500 }
        );
      }
      referral = newReferral;
    }

    if (!referral) {
      return NextResponse.json(
        { error: "Failed to get referral code" },
        { status: 500 }
      );
    }

    // Get stats
    const { count: signups } = await supabase
      .from("referral_usage")
      .select("*", { count: "exact", head: true })
      .eq("referral_code", referral.referral_code);

    const { count: bets } = await supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .in(
        "user_id",
        supabase
          .from("referral_usage")
          .select("user_id")
          .eq("referral_code", referral.referral_code)
      )
      .eq("is_draft", false);

    return NextResponse.json({
      code: referral.referral_code,
      totalReferrals: signups || 0,
      totalSignups: signups || 0,
      totalBets: bets || 0,
      rewards: parseFloat(referral.rewards?.toString() || "0"),
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateUniqueCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Check if code exists
  const { data } = await supabase
    .from("referrals")
    .select("id")
    .eq("referral_code", code)
    .single();

  if (data) {
    // Code exists, generate new one
    return generateUniqueCode();
  }

  return code;
}

