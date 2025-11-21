import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/admin/bets
 * Get all bets with filters
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("bets")
      .select(
        `
        *,
        users:user_id (
          id,
          clerk_id,
          name,
          email
        ),
        charities:charity_id (
          id,
          name
        ),
        anti_charities:anti_charity_id (
          id,
          name
        )
      `
      )
      .eq("is_draft", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch bets" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .eq("is_draft", false);

    if (status && status !== "all") {
      countQuery = countQuery.eq("status", status);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      bets: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching bets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

