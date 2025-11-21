"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2, Twitter, Instagram, Copy } from "lucide-react";
import html2canvas from "html2canvas";

interface ShareableCardProps {
  userName: string;
  stats: {
    streak: number;
    wins: number;
    fails: number;
    totalDonated: number;
    winRate: number;
  };
  className?: string;
}

export function ShareableCard({ userName, stats, className }: ShareableCardProps) {
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
      link.download = `regretwallet-stats-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

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

      if (navigator.share && navigator.canShare?.({ files: [new File([blob], "stats.png", { type: "image/png" })] })) {
        await navigator.share({
          title: "My RegretWallet Stats",
          text: `Check out my stats on RegretWallet! 🔥`,
          files: [new File([blob], "stats.png", { type: "image/png" })],
        });
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(
          `Check out my RegretWallet stats! 🔥\n\n` +
            `Streak: ${stats.streak} wins\n` +
            `Wins: ${stats.wins}\n` +
            `Fails: ${stats.fails}\n` +
            `Total Donated: $${stats.totalDonated.toFixed(2)}\n` +
            `Win Rate: ${stats.winRate.toFixed(1)}%`
        );
        alert("Stats copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
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

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png");
      });

      // Create a temporary URL for the image
      const imageUrl = URL.createObjectURL(blob);

      // Note: Twitter sharing with images requires Twitter API or a service like imgur
      // For now, we'll share text with a link
      const text = `Check out my RegretWallet stats! 🔥\n\n${stats.streak} win streak • ${stats.wins} wins • $${stats.totalDonated.toFixed(2)} donated`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");

      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error("Error sharing to Twitter:", error);
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
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          alert("Image copied to clipboard!");
        }
      }, "image/png");
    } catch (error) {
      console.error("Error copying image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Card ref={cardRef} className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RegretWallet
            </h2>
            <h3 className="text-lg font-semibold">{userName}'s Stats</h3>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold text-orange-500">{stats.streak} 🔥</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-green-500">{stats.winRate.toFixed(1)}%</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Wins</p>
                <p className="text-2xl font-bold">{stats.wins}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Fails</p>
                <p className="text-2xl font-bold">{stats.fails}</p>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-muted-foreground">Total Donated</p>
              <p className="text-3xl font-bold text-purple-500">${stats.totalDonated.toFixed(2)}</p>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              regretwallet.com
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        <Button
          onClick={handleDownload}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          onClick={handleCopyImage}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Image
        </Button>
        <Button
          onClick={handleShare}
          disabled={loading || !navigator.share}
          variant="outline"
          size="sm"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button
          onClick={handleTwitterShare}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
      </div>
    </div>
  );
}

