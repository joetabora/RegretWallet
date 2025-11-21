import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

/**
 * Check if the current user is an admin
 * Admins are identified by having their email in the ADMIN_EMAILS env variable
 * or by having an admin flag in the users table (if you add it)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) {
      return false;
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return false;
    }

    // Check environment variable for admin emails (comma-separated)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
    if (adminEmails.includes(userEmail)) {
      return true;
    }

    // Alternatively, check if user has admin role in database
    // You can add an `is_admin` column to the users table
    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    // For now, return false if not in admin emails
    // You can extend this to check a database flag
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
  return true;
}

