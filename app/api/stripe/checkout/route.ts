import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { createCheckoutSession } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for bet payment
 */
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { betId } = body;

    if (!betId) {
      return NextResponse.json(
        { error: "betId is required" },
        { status: 400 }
      );
    }

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

    // Verify bet is in pending state
    if (bet.status !== "pending" && bet.status !== "draft") {
      return NextResponse.json(
        { error: "Bet is not in a valid state for checkout" },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await createCheckoutSession({
      betId: bet.id,
      amount: parseFloat(bet.amount),
      title: bet.title,
      description: bet.description || `Bet: ${bet.title}`,
      userId: user.id,
      userEmail: user.emailAddresses[0].emailAddress,
    });

    // Update bet with checkout session ID
    await supabase
      .from("bets")
      .update({
        checkout_session_id: session.id,
        status: "pending",
      })
      .eq("id", betId);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

