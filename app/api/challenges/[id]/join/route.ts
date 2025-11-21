import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/challenges/[id]/join
 * Join a group challenge
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challengeId = params.id;

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

    // Check if challenge exists and is active
    const { data: challenge, error: challengeError } = await supabase
      .from("group_challenges")
      .select("*")
      .eq("id", challengeId)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (challenge.status !== "active") {
      return NextResponse.json(
        { error: "Challenge is not active" },
        { status: 400 }
      );
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from("challenge_participants")
      .select("id")
      .eq("challenge_id", challengeId)
      .eq("user_id", dbUser.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Already joined this challenge" },
        { status: 400 }
      );
    }

    // Join challenge
    const { error: joinError } = await supabase
      .from("challenge_participants")
      .insert({
        challenge_id: challengeId,
        user_id: dbUser.id,
      });

    if (joinError) {
      return NextResponse.json(
        { error: "Failed to join challenge" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

