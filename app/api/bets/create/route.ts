import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEscrowPaymentIntent } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, amount, charityId, outcome } = body;

    // Validate input
    if (!title || !amount || !charityId || !outcome) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get or create user in Supabase
    let { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError && userError.code === "PGRST116") {
      // User doesn't exist, create them
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          clerk_id: user.id,
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName} ${user.lastName}`.trim() || undefined,
        })
        .select("id")
        .single();

      if (createError || !newUser) {
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
      dbUser = newUser;
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Failed to get user" },
        { status: 500 }
      );
    }

    // Create Stripe payment intent for escrow
    const paymentIntent = await createEscrowPaymentIntent(
      parseFloat(amount),
      "temp-bet-id"
    );

    // Create bet in Supabase
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .insert({
        user_id: dbUser.id,
        charity_id: charityId,
        title,
        description: description || null,
        amount: parseFloat(amount),
        outcome,
        status: "pending",
        payment_intent_id: paymentIntent.id,
      })
      .select("id")
      .single();

    if (betError || !bet) {
      // Cancel payment intent if bet creation fails
      await fetch(`/api/stripe/cancel-intent`, {
        method: "POST",
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });

      return NextResponse.json(
        { error: "Failed to create bet" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      betId: bet.id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating bet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

