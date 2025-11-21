import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { processBetFailure } from "@/lib/stripe";

const PLATFORM_FEE_PERCENTAGE = 0.2; // 20%

/**
 * POST /api/bets/[id]/failure
 * Processes a failed bet outcome - deducts 20% platform fee and donates remaining to anti-charity
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: betId } = await params;

    // Get bet from Supabase with anti-charity info
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .select(`
        *,
        anti_charities:anti_charity_id (
          id,
          name,
          stripe_account_id
        )
      `)
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

    // Verify bet is in active state
    if (bet.status !== "active") {
      return NextResponse.json(
        { error: "Bet is not in active state" },
        { status: 400 }
      );
    }

    // Verify payment intent exists
    if (!bet.payment_intent_id) {
      return NextResponse.json(
        { error: "Payment intent not found" },
        { status: 400 }
      );
    }

    // Verify anti-charity exists
    if (!bet.anti_charity_id) {
      return NextResponse.json(
        { error: "Anti-charity not found for this bet" },
        { status: 400 }
      );
    }

    const antiCharity = Array.isArray(bet.anti_charities) 
      ? bet.anti_charities[0] 
      : bet.anti_charities;

    if (!antiCharity || !antiCharity.stripe_account_id) {
      return NextResponse.json(
        { error: "Anti-charity Stripe account not configured" },
        { status: 400 }
      );
    }

    // Calculate amounts
    const betAmount = parseFloat(bet.amount);
    const platformFee = betAmount * PLATFORM_FEE_PERCENTAGE;
    const donationAmount = betAmount - platformFee;

    // Process failure (capture payment, deduct fee, transfer to anti-charity)
    const failureResult = await processBetFailure({
      paymentIntentId: bet.payment_intent_id,
      betId: bet.id,
      totalAmount: betAmount,
      platformFeePercentage: PLATFORM_FEE_PERCENTAGE,
      antiCharityStripeAccountId: antiCharity.stripe_account_id,
      antiCharityName: antiCharity.name,
    });

    // Update bet status in Supabase
    const { error: updateError } = await supabase
      .from("bets")
      .update({
        status: "lost",
        platform_fee: platformFee,
        donation_amount: donationAmount,
        transfer_id: failureResult.transferId,
        escrow_captured_at: new Date().toISOString(),
        resolved_at: new Date().toISOString(),
      })
      .eq("id", betId);

    if (updateError) {
      console.error("Error updating bet:", updateError);
      return NextResponse.json(
        { error: "Failed to update bet" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      betId: bet.id,
      platformFee,
      donationAmount,
      transferId: failureResult.transferId,
      paymentIntentId: failureResult.paymentIntentId,
    });
  } catch (error) {
    console.error("Error processing bet failure:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

