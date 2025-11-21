"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharityManagement } from "./charity-management";
import { BetManagement } from "./bet-management";
import { DonationReceipts } from "./donation-receipts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminPanelClient() {
  const [activeTab, setActiveTab] = useState("charities");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
        <TabsTrigger value="charities">Charities</TabsTrigger>
        <TabsTrigger value="bets">Bets</TabsTrigger>
        <TabsTrigger value="donations">Donation Receipts</TabsTrigger>
      </TabsList>

      <TabsContent value="charities">
        <CharityManagement />
      </TabsContent>

      <TabsContent value="bets">
        <BetManagement />
      </TabsContent>

      <TabsContent value="donations">
        <DonationReceipts />
      </TabsContent>
    </Tabs>
  );
}

