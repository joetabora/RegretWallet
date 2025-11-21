import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/referrals/track
 * Track referral usage when user signs up
 */
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json({ success: true }); // No referral code, just return success
    }

    // Get or create user in Supabase
    let { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (!dbUser) {
      // User might not exist yet, create them first
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          clerk_id: user.id,
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName} ${user.lastName}`.trim() || undefined,
        })
        .select("id")
        .single();

      if (!newUser) {
        return NextResponse.json({ success: true }); // Just continue
      }
      dbUser = newUser;
    }

    // Check if referral code exists
    const { data: referral } = await supabase
      .from("referrals")
      .select("referrer_id")
      .eq("referral_code", referralCode.toUpperCase())
      .single();

    if (!referral) {
      return NextResponse.json({ success: true }); // Invalid code, but don't error
    }

    // Check if user already used a referral code
    const { data: existing } = await supabase
      .from("referral_usage")
      .select("id")
      .eq("user_id", dbUser.id)
      .single();

    if (existing) {
      return NextResponse.json({ success: true }); // Already used a referral
    }

    // Record referral usage
    await supabase.from("referral_usage").insert({
      referral_code: referralCode.toUpperCase(),
      user_id: dbUser.id,
    });

    // Update referral stats - get current count and increment
    const { data: currentReferral } = await supabase
      .from("referrals")
      .select("total_signups")
      .eq("referral_code", referralCode.toUpperCase())
      .single();

    if (currentReferral) {
      await supabase
        .from("referrals")
        .update({
          total_signups: (currentReferral.total_signups || 0) + 1,
        })
        .eq("referral_code", referralCode.toUpperCase());
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking referral:", error);
    // Don't fail the signup process if referral tracking fails
    return NextResponse.json({ success: true });
  }
}

