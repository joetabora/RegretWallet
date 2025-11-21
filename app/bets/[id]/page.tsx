import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/back-button";
import { BetShareCard } from "@/components/social/bet-share-card";

// Mock data - replace with actual Supabase query
async function getBet(id: string) {
  // TODO: Fetch from Supabase
  // const { data, error } = await supabase
  //   .from("bets")
  //   .select("*, charities(*), users(*)")
  //   .eq("id", id)
  //   .single();

  return {
    id,
    title: "I'll run a marathon this year",
    description: "I commit to completing a full marathon (26.2 miles) before the end of this year.",
    amount: 100,
    status: "active",
    charityName: "American Red Cross",
    charityId: "1",
    outcome: "Complete a 26.2 mile run before December 31, 2024",
    resolutionDate: "2024-12-31T23:59:59Z",
    createdAt: new Date().toISOString(),
    paymentIntentId: "pi_mock123",
  };
}

export default async function BetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const bet = await getBet(id);

  if (!bet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Bet not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "won":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "lost":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <BackButton />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{bet.title}</CardTitle>
              <CardDescription className="text-base">
                Created on {new Date(bet.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={`${getStatusColor(bet.status)} text-sm px-3 py-1`}>
              {bet.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {bet.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{bet.description}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Expected Outcome</h3>
            <p className="text-muted-foreground">{bet.outcome}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bet Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${bet.amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {bet.status === "active" || bet.status === "pending"
                    ? "Held in escrow"
                    : bet.status === "lost"
                    ? "Donated to charity"
                    : "Refunded"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Charity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{bet.charityName}</p>
                {bet.status === "lost" && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ✓ Donation completed
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {bet.resolutionDate && (
            <div>
              <h3 className="font-semibold mb-2">Resolution Date</h3>
              <p className="text-muted-foreground">
                {new Date(bet.resolutionDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {bet.status === "active" && (
            <div className="pt-4 border-t">
              <Button variant="destructive">Resolve Bet (Admin Only)</Button>
            </div>
          )}

          {/* Share Card for Won/Lost Bets */}
          {(bet.status === "won" || bet.status === "lost") && (
            <div className="pt-4 border-t">
              <BetShareCard betId={bet.id} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

