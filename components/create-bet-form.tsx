"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Charity {
  id: string;
  name: string;
}

interface CreateBetFormProps {
  charities: Charity[];
}

export function CreateBetForm({ charities }: CreateBetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    charityId: "",
    outcome: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/bets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/bets/${data.betId}`);
      } else {
        console.error("Failed to create bet");
      }
    } catch (error) {
      console.error("Error creating bet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bet Details</CardTitle>
        <CardDescription>Fill in the information for your bet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Bet Title *</Label>
            <Input
              id="title"
              placeholder="e.g., I'll run a marathon this year"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details about your bet..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Expected Outcome *</Label>
            <Input
              id="outcome"
              placeholder="e.g., Complete a 26.2 mile run before December 31, 2024"
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              required
            />
            <p className="text-sm text-muted-foreground">
              Clearly define what needs to happen for you to win this bet.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Bet Amount (USD) *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="100.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <p className="text-sm text-muted-foreground">
              This amount will be held in escrow. If you lose, it goes to charity.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="charity">Select Charity *</Label>
            <Select
              value={formData.charityId}
              onValueChange={(value) => setFormData({ ...formData, charityId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a charity..." />
              </SelectTrigger>
              <SelectContent>
                {charities.map((charity) => (
                  <SelectItem key={charity.id} value={charity.id}>
                    {charity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Bet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

