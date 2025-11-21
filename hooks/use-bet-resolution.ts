"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UseBetResolutionOptions {
  onSuccess?: (result: BetResolutionResult) => void;
  onError?: (error: Error) => void;
}

interface BetResolutionResult {
  success: boolean;
  betId: string;
  refundId?: string;
  refundAmount?: number;
  platformFee?: number;
  donationAmount?: number;
  transferId?: string;
}

interface UseBetResolutionReturn {
  resolveSuccess: (betId: string) => Promise<void>;
  resolveFailure: (betId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook for resolving bets (success or failure)
 */
export function useBetResolution(
  options?: UseBetResolutionOptions
): UseBetResolutionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const resolveSuccess = async (betId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bets/${betId}/success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resolve bet success");
      }

      const result: BetResolutionResult = await response.json();

      options?.onSuccess?.(result);
      router.refresh(); // Refresh to show updated bet status
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to resolve bet success");
      setError(error);
      options?.onError?.(error);
      console.error("Bet resolution error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resolveFailure = async (betId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bets/${betId}/failure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resolve bet failure");
      }

      const result: BetResolutionResult = await response.json();

      options?.onSuccess?.(result);
      router.refresh(); // Refresh to show updated bet status
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to resolve bet failure");
      setError(error);
      options?.onError?.(error);
      console.error("Bet resolution error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    resolveSuccess,
    resolveFailure,
    loading,
    error,
  };
}

