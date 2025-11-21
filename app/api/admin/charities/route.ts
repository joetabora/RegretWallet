import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/admin/charities
 * Get all charities (including inactive ones)
 */
export async function GET() {
  try {
    await requireAdmin();

    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch charities" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching charities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/charities
 * Create a new charity
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, description, stripe_account_id, website_url, logo_url, is_active } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("charities")
      .insert({
        name,
        description: description || null,
        stripe_account_id: stripe_account_id || null,
        website_url: website_url || null,
        logo_url: logo_url || null,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create charity" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error creating charity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

