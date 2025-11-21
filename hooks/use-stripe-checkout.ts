"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe (only once)
const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

interface UseStripeCheckoutOptions {
  onSuccess?: (betId: string) => void;
  onError?: (error: Error) => void;
}

interface UseStripeCheckoutReturn {
  createCheckout: (betId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook for creating Stripe checkout sessions
 */
export function useStripeCheckout(
  options?: UseStripeCheckoutOptions
): UseStripeCheckoutReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const createCheckout = async (betId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ betId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { sessionId, url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        // Fallback: use Stripe.js redirect
        const stripe = await getStripe();
        if (stripe) {
          await stripe.redirectToCheckout({
            sessionId,
          });
        }
      }

      // Call success callback if provided
      options?.onSuccess?.(betId);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to create checkout session");
      setError(error);
      options?.onError?.(error);
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckout,
    loading,
    error,
  };
}

