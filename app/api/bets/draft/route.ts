import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { draftId, userId, step, data } = body;

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

    // If draftId exists, update the draft
    if (draftId) {
      const { data: draft, error: updateError } = await supabase
        .from("bets")
        .update({
          draft_data: data,
          title: data.step1?.goal || null,
          description: data.step1?.description || null,
          amount: data.step2 || null,
          duration_weeks: data.step3 || null,
          proof_method: data.step4 || null,
          anti_charity_id: data.step5 || null,
        })
        .eq("id", draftId)
        .eq("user_id", dbUser.id)
        .eq("is_draft", true)
        .select("id")
        .single();

      if (updateError || !draft) {
        return NextResponse.json(
          { error: "Failed to update draft" },
          { status: 500 }
        );
      }

      return NextResponse.json({ draftId: draft.id });
    }

    // Create new draft (charity_id can be null for drafts)
    const { data: draft, error: createError } = await supabase
      .from("bets")
      .insert({
        user_id: dbUser.id,
        charity_id: null, // Will be set when bet is finalized
        title: data.step1?.goal || "",
        description: data.step1?.description || null,
        amount: data.step2 || 0,
        duration_weeks: data.step3 || null,
        proof_method: data.step4 || null,
        anti_charity_id: data.step5 || null,
        status: "draft",
        is_draft: true,
        draft_data: data,
      })
      .select("id")
      .single();

    if (createError || !draft) {
      return NextResponse.json(
        { error: "Failed to create draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({ draftId: draft.id });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

