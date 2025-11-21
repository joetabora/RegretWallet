"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Twitter, Download, Copy, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

interface SocialShareCardProps {
  bet: {
    id: string;
    title: string;
    amount: number;
    status: "won" | "lost";
    charityName?: string;
    antiCharityName?: string;
    userName: string;
    resolvedAt?: string;
  };
  onShare?: (platform: string) => void;
  className?: string;
}

export function SocialShareCard({ bet, onShare, className }: SocialShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isWin = bet.status === "won";
  const gradientClass = isWin
    ? "from-green-500/20 via-blue-500/20 to-purple-500/20 dark:from-green-900/30 dark:via-blue-900/30 dark:to-purple-900/30"
    : "from-red-500/20 via-orange-500/20 to-pink-500/20 dark:from-red-900/30 dark:via-orange-900/30 dark:to-pink-900/30";

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `regretwallet-${bet.status}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      onShare?.("download");
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          onShare?.("copy");
        }
      }, "image/png");
    } catch (error) {
      console.error("Error copying image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTwitterShare = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      // Upload image to a service or use Twitter's API
      // For now, we'll share text with a link to the bet
      const text = isWin
        ? `🎉 I won my bet on RegretWallet!\n\n"${bet.title}"\n\n${bet.userName}'s ${bet.status === "won" ? "win" : "donation"} streak continues! 🔥`
        : `💔 I failed my bet on RegretWallet, but $${bet.amount.toFixed(2)} went to charity!\n\n"${bet.title}"\n\nTurning failures into donations ❤️`;

      const url = `https://regretwallet.com/bets/${bet.id}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, "_blank");
      onShare?.("twitter");
    } catch (error) {
      console.error("Error sharing to Twitter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNativeShare = async () => {
    if (!cardRef.current) return;
    if (!navigator.share) {
      handleCopyImage();
      return;
    }

    setLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png");
      });

      await navigator.share({
        title: `My RegretWallet ${bet.status === "won" ? "Win" : "Donation"}`,
        text: isWin
          ? `I won my bet: "${bet.title}"`
          : `I donated $${bet.amount.toFixed(2)} to charity: "${bet.title}"`,
        files: [new File([blob], "bet-result.png", { type: "image/png" })],
      });
      onShare?.("native");
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        ref={cardRef}
        className={cn(
          "w-full max-w-md mx-auto bg-gradient-to-br",
          gradientClass,
          "border-2 shadow-xl"
        )}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                RegretWallet
              </h2>
              <Badge
                variant={isWin ? "default" : "destructive"}
                className={cn(
                  "text-lg px-4 py-1",
                  isWin
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                )}
              >
                {isWin ? "🎉 YOU WON!" : "💔 DONATION MADE"}
              </Badge>
            </div>

            {/* Bet Info */}
            <div className="space-y-3">
              <div className="text-4xl mb-2">{isWin ? "🏆" : "❤️"}</div>
              <h3 className="text-xl font-bold line-clamp-2">{bet.title}</h3>
              <div className="text-sm text-muted-foreground">
                {bet.userName}
              </div>
            </div>

            {/* Result */}
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-6 space-y-3">
              {isWin ? (
                <>
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                  <p className="text-4xl font-bold text-green-600">
                    ${bet.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Full amount returned!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Donation Amount</p>
                  <p className="text-4xl font-bold text-red-600">
                    ${bet.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Donated to {bet.charityName || bet.antiCharityName || "charity"}
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/20">
              <p className="text-xs text-muted-foreground">
                regretwallet.com
              </p>
              {bet.resolvedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(bet.resolvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          onClick={handleTwitterShare}
          disabled={loading}
          className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Twitter className="h-4 w-4 mr-2" />
          Share on X
        </Button>
        <Button
          onClick={handleNativeShare}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button
          onClick={handleCopyImage}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <Copy className="h-4 w-4 mr-2" />
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button
          onClick={handleDownload}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}

