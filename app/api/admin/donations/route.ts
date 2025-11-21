import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

/**
 * GET /api/admin/donations
 * Get all donation receipts (failed bets with Stripe transfer info)
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch all lost bets (donations)
    const { data: bets, error: betsError } = await supabase
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
      .eq("status", "lost")
      .eq("is_draft", false)
      .not("transfer_id", "is", null)
      .order("resolved_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (betsError) {
      return NextResponse.json(
        { error: "Failed to fetch donations" },
        { status: 500 }
      );
    }

    // Enrich with Stripe transfer data
    const donations = await Promise.all(
      (bets || []).map(async (bet) => {
        let stripeTransfer = null;
        if (bet.transfer_id) {
          try {
            stripeTransfer = await stripe.transfers.retrieve(bet.transfer_id);
          } catch (error) {
            console.error(`Error fetching transfer ${bet.transfer_id}:`, error);
          }
        }

        return {
          ...bet,
          stripeTransfer,
        };
      })
    );

    // Get total count
    const { count } = await supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .eq("status", "lost")
      .eq("is_draft", false)
      .not("transfer_id", "is", null);

    return NextResponse.json({
      donations,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

