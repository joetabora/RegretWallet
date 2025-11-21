"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, DollarSign, Calendar, User, Building2 } from "lucide-react";
import Link from "next/link";

interface Donation {
  id: string;
  title: string;
  amount: number;
  donation_amount?: number;
  platform_fee?: number;
  transfer_id?: string;
  resolved_at?: string;
  users?: {
    name?: string;
    email: string;
  };
  charities?: {
    name: string;
  };
  anti_charities?: {
    name: string;
  };
  stripeTransfer?: any;
}

export function DonationReceipts() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalFees, setTotalFees] = useState(0);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/donations?limit=100");
      if (response.ok) {
        const data = await response.json();
        setDonations(data.donations || []);
        
        // Calculate totals
        const donated = (data.donations || []).reduce(
          (sum: number, d: Donation) => sum + parseFloat(d.donation_amount?.toString() || d.amount?.toString() || "0"),
          0
        );
        const fees = (data.donations || []).reduce(
          (sum: number, d: Donation) => sum + parseFloat(d.platform_fee?.toString() || "0"),
          0
        );
        setTotalDonated(donated);
        setTotalFees(fees);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading donation receipts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Donation Receipts</h2>
        <p className="text-muted-foreground">
          View all donations made through failed bets
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalDonated.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {donations.length} {donations.length === 1 ? "donation" : "donations"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalFees.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              20% of bet amounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${donations.length > 0 ? (totalDonated / donations.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per donation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Donations List */}
      <div className="space-y-4">
        {donations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No donations found</p>
            </CardContent>
          </Card>
        ) : (
          donations.map((donation) => (
            <Card key={donation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{donation.title}</CardTitle>
                    <CardDescription className="mb-3">
                      Failed bet donation receipt
                    </CardDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{donation.users?.name || donation.users?.email || "Unknown User"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>
                          {donation.charities?.name || donation.anti_charities?.name || "Unknown Charity"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(donation.resolved_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Original: ${donation.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    DONATED
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Donation Amount</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${(donation.donation_amount || donation.amount * 0.8).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Platform Fee</p>
                    <p className="text-lg font-semibold">
                      ${(donation.platform_fee || donation.amount * 0.2).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Bet Amount</p>
                    <p className="text-lg font-semibold">
                      ${donation.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {donation.transfer_id && (
                    <Badge variant="outline" className="text-xs">
                      Transfer: {donation.transfer_id.slice(0, 20)}...
                    </Badge>
                  )}
                  {donation.stripeTransfer && (
                    <a
                      href={`https://dashboard.stripe.com/transfers/${donation.transfer_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View in Stripe
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <Link href={`/bets/${donation.id}`}>
                    <Button variant="outline" size="sm">
                      View Bet
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

