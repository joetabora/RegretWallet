import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const minHateScore = searchParams.get("minHateScore");
    const maxHateScore = searchParams.get("maxHateScore");

    let query = supabase
      .from("anti_charities")
      .select("*")
      .eq("is_active", true)
      .order("hate_score", { ascending: false });

    // Apply category filter if provided
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Apply hate score filters if provided
    if (minHateScore) {
      query = query.gte("hate_score", parseInt(minHateScore));
    }
    if (maxHateScore) {
      query = query.lte("hate_score", parseInt(maxHateScore));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching anti-charities:", error);
      return NextResponse.json(
        { error: "Failed to fetch anti-charities" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error in anti-charities API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

