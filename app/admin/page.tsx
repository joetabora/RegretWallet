import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { AdminPanelClient } from "@/components/admin/admin-panel-client";

export default async function AdminPanel() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const admin = await isAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage charities, bets, and view donation receipts
        </p>
      </div>

      <AdminPanelClient />
    </div>
  );
}
