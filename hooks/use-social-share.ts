"use client";

import { useState } from "react";

interface UseSocialShareOptions {
  betId: string;
  onShare?: (platform: string) => void;
}

interface UseSocialShareReturn {
  shareToTwitter: () => Promise<void>;
  shareToNative: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for sharing bet outcomes to social media
 */
export function useSocialShare({ betId, onShare }: UseSocialShareOptions): UseSocialShareReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const shareToTwitter = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/social/auto-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betId, platform: "twitter" }),
      });

      if (!response.ok) {
        throw new Error("Failed to get share data");
      }

      const data = await response.json();
      const { bet, shareUrl } = data;

      const text = bet.status === "won"
        ? `🎉 I won my bet on RegretWallet!\n\n"${bet.title}"\n\nMy win streak continues! 🔥`
        : `💔 I failed my bet, but $${bet.amount.toFixed(2)} went to charity!\n\n"${bet.title}"\n\nTurning failures into donations ❤️`;

      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, "_blank");
      onShare?.("twitter");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to share");
      setError(error);
      console.error("Share error:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareToNative = async () => {
    if (!navigator.share) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/social/auto-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betId }),
      });

      if (!response.ok) {
        throw new Error("Failed to get share data");
      }

      const data = await response.json();
      const { bet, shareUrl } = data;

      await navigator.share({
        title: `My RegretWallet ${bet.status === "won" ? "Win" : "Donation"}`,
        text: bet.status === "won"
          ? `I won my bet: "${bet.title}"`
          : `I donated $${bet.amount.toFixed(2)} to charity: "${bet.title}"`,
        url: shareUrl,
      });

      onShare?.("native");
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        const error = err instanceof Error ? err : new Error("Failed to share");
        setError(error);
        console.error("Share error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    shareToTwitter,
    shareToNative,
    loading,
    error,
  };
}

