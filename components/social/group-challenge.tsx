"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Trophy, Calendar, DollarSign, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupChallenge {
  id: string;
  name: string;
  description?: string;
  goal: string;
  target_amount: number;
  duration_weeks: number;
  created_by: string;
  created_at: string;
  end_date: string;
  participants: number;
  total_bets: number;
  total_donated: number;
  status: "active" | "completed" | "cancelled";
}

export function GroupChallengeManager({ userId }: { userId: string }) {
  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "",
    target_amount: "",
    duration_weeks: "4",
  });

  useEffect(() => {
    fetchChallenges();
  }, [userId]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/challenges");
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          goal: "",
          target_amount: "",
          duration_weeks: "4",
        });
        fetchChallenges();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create challenge");
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      alert("Failed to create challenge");
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: "POST",
      });

      if (response.ok) {
        fetchChallenges();
        alert("Successfully joined challenge!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to join challenge");
      }
    } catch (error) {
      console.error("Error joining challenge:", error);
      alert("Failed to join challenge");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const activeChallenges = challenges.filter((c) => c.status === "active");
  // Note: created_by is UUID, userId is Clerk ID - need to map this
  const myChallenges = challenges; // Will be filtered by participant check later

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Group Challenges
          </h2>
          <p className="text-muted-foreground">
            Create or join group challenges with friends
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Group Challenge</DialogTitle>
              <DialogDescription>
                Set up a challenge that multiple people can join
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Challenge Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., January Fitness Challenge"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Challenge Goal *</Label>
                <Input
                  id="goal"
                  value={formData.goal}
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value })
                  }
                  placeholder="e.g., Everyone runs a 5K"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the challenge..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_amount">Target Amount ($) *</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    min="10"
                    value={formData.target_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, target_amount: e.target.value })
                    }
                    placeholder="100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_weeks">Duration (weeks) *</Label>
                  <Input
                    id="duration_weeks"
                    type="number"
                    min="1"
                    max="52"
                    value={formData.duration_weeks}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_weeks: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateChallenge}>Create Challenge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Challenges */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Challenges</h3>
        {activeChallenges.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No active challenges</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="mb-1">{challenge.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {challenge.goal}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {challenge.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {challenge.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{challenge.participants} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{challenge.total_bets} bets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${challenge.target_amount} target</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(challenge.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <Button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="w-full"
                      size="sm"
                    >
                      Join Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Challenges */}
      {myChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">My Challenges</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {myChallenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{challenge.name}</CardTitle>
                  <CardDescription>{challenge.goal}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {challenge.participants} participants
                    </span>
                    <Badge
                      variant={
                        challenge.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {challenge.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

