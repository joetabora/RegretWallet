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
    const { draftId, userId, data } = body;

    // Get or create user in Supabase
    let { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError && userError.code === "PGRST116") {
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

    // Validate required fields
    if (!data.step1?.goal || !data.step2 || !data.step3 || !data.step4 || !data.step5) {
      return NextResponse.json(
        { error: "Missing required fields. Please complete all steps." },
        { status: 400 }
      );
    }

    // For now, use anti_charity_id as charity_id (you may want to separate this)
    // In production, you might have separate charity and anti-charity tables

    // Calculate resolution date
    const resolutionDate = new Date();
    resolutionDate.setDate(resolutionDate.getDate() + data.step3 * 7);

    // Create Stripe payment intent for escrow
    const paymentIntent = await createEscrowPaymentIntent(
      parseFloat(data.step2),
      draftId || "temp-bet-id"
    );

    // If draft exists, update it; otherwise create new bet
    let bet;
    if (draftId) {
      const { data: updatedBet, error: updateError } = await supabase
        .from("bets")
        .update({
          charity_id: data.step5, // Using anti-charity as the charity for now
          title: data.step1.goal,
          description: data.step1.description || null,
          amount: parseFloat(data.step2),
          duration_weeks: data.step3,
          proof_method: data.step4,
          anti_charity_id: data.step5,
          outcome: data.step1.goal, // Set outcome from goal
          resolution_date: resolutionDate.toISOString(),
          payment_intent_id: paymentIntent.id,
          status: "pending",
          is_draft: false,
          draft_data: null,
        })
        .eq("id", draftId)
        .eq("user_id", dbUser.id)
        .select("id")
        .single();

      if (updateError || !updatedBet) {
        // Cancel payment intent if update fails
        await fetch(`/api/stripe/cancel-intent`, {
          method: "POST",
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        return NextResponse.json(
          { error: "Failed to update bet" },
          { status: 500 }
        );
      }
      bet = updatedBet;
    } else {
      // Create new bet
      const { data: newBet, error: createError } = await supabase
        .from("bets")
        .insert({
          user_id: dbUser.id,
          charity_id: data.step5, // Using anti-charity as the charity for now
          title: data.step1.goal,
          description: data.step1.description || null,
          amount: parseFloat(data.step2),
          duration_weeks: data.step3,
          proof_method: data.step4,
          anti_charity_id: data.step5,
          outcome: data.step1.goal, // Set outcome from goal
          resolution_date: resolutionDate.toISOString(),
          payment_intent_id: paymentIntent.id,
          status: "pending",
          is_draft: false,
        })
        .select("id")
        .single();

      if (createError || !newBet) {
        // Cancel payment intent if creation fails
        await fetch(`/api/stripe/cancel-intent`, {
          method: "POST",
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        return NextResponse.json(
          { error: "Failed to create bet" },
          { status: 500 }
        );
      }
      bet = newBet;
    }

    return NextResponse.json({
      betId: bet.id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating bet from draft:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

