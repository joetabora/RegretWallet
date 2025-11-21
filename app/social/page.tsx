import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SocialDashboard } from "@/components/social/social-dashboard";

export default async function SocialPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Social Hub</h1>
        <p className="text-muted-foreground">
          Share your bets, earn referrals, and join group challenges
        </p>
      </div>

      <SocialDashboard userId={user.id} userName={user.firstName || user.emailAddresses[0].emailAddress || "User"} />
    </div>
  );
}

