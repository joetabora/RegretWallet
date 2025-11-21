import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to RegretWallet
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Turn your bets into good deeds. When you lose, we donate to charity automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Place Bets</CardTitle>
            <CardDescription>Create meaningful wagers on outcomes you care about</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set your stakes and choose a charity. If you lose, your money goes to a good cause.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Escrow Protection</CardTitle>
            <CardDescription>Secure payments held safely until bet resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Funds are held securely in escrow using Stripe. Your money is safe until the bet is resolved.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charity Impact</CardTitle>
            <CardDescription>Track your donations and see the difference you make</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View all your past bets and the charities that benefited from your contributions.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/dashboard">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}

