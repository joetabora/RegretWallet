import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { processBetSuccess } from "@/lib/stripe";

/**
 * POST /api/bets/[id]/success
 * Processes a successful bet outcome - refunds full amount to user
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

    // Get bet from Supabase
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .select("*")
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

    // Process refund
    const refundResult = await processBetSuccess({
      paymentIntentId: bet.payment_intent_id,
      betId: bet.id,
      amount: parseFloat(bet.amount),
    });

    // Update bet status in Supabase
    const { error: updateError } = await supabase
      .from("bets")
      .update({
        status: "won",
        refund_id: refundResult.refundId,
        refund_amount: refundResult.amount,
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
      refundId: refundResult.refundId,
      refundAmount: refundResult.amount,
    });
  } catch (error) {
    console.error("Error processing bet success:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

