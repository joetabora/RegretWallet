"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

/**
 * Component to track referral code usage on signup
 * Should be included in the sign-up page
 */
export function ReferralSignupHandler() {
  const searchParams = useSearchParams();
  const { isSignedIn, user } = useUser();
  const referralCode = searchParams.get("ref");

  useEffect(() => {
    const trackReferral = async () => {
      if (!isSignedIn || !user || !referralCode) {
        return;
      }

      // Wait a moment for user to be fully created in Supabase
      setTimeout(async () => {
        try {
          await fetch("/api/referrals/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ referralCode }),
          });
        } catch (error) {
          console.error("Error tracking referral:", error);
        }
      }, 3000);
    };

    trackReferral();
  }, [isSignedIn, user, referralCode]);

  return null;
}

