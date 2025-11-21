"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, Calendar, DollarSign } from "lucide-react";

interface Bet {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: string;
  charityName: string;
  charityId: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionDate?: string;
}

interface BetListProps {
  bets: Bet[];
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
  className?: string;
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
    case "cancelled":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export function BetList({ bets, emptyMessage, emptyAction, className }: BetListProps) {
  if (bets.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">{emptyMessage || "No bets found"}</p>
          {emptyAction && (
            <Link href={emptyAction.href}>
              <Button>{emptyAction.label}</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {bets.map((bet) => (
        <Card key={bet.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="mb-2 text-lg">{bet.title}</CardTitle>
                {bet.description && (
                  <CardDescription className="line-clamp-2">{bet.description}</CardDescription>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{`$${bet.amount.toFixed(2)}`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {bet.resolvedAt
                        ? new Date(bet.resolvedAt).toLocaleDateString()
                        : bet.resolutionDate
                        ? `Due: ${new Date(bet.resolutionDate).toLocaleDateString()}`
                        : new Date(bet.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-muted-foreground">{bet.charityName}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge className={cn("text-xs font-medium", getStatusColor(bet.status))}>
                  {bet.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href={`/bets/${bet.id}`}>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

