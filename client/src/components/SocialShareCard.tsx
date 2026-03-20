import { useState } from "react";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Download,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface SocialShareCardProps {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  healthScore: number;
  scanId: string;
  imageUrl?: string;
  userName?: string;
}

export function SocialShareCard({
  foodName,
  calories,
  protein,
  carbs,
  fats,
  healthScore,
  scanId,
  imageUrl,
  userName,
}: SocialShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState<string | null>(null);

  const appName = "ScanEat";
  const appWebsite = "scaneat.app";
  const appLogo = "🍽️";

  // Generate hashtags based on food type and health score
  const generateHashtags = (): string => {
    const baseHashtags = ["#ScanEat", "#NutritionTracking", "#HealthyEating"];
    const healthHashtags =
      healthScore >= 8
        ? ["#HealthyChoice", "#NutritionWin"]
        : healthScore >= 5
          ? ["#BalancedMeal"]
          : ["#MealTracking"];

    return [...baseHashtags, ...healthHashtags].join(" ");
  };

  // Create shareable text
  const createShareText = (): string => {
    return `I just scanned "${foodName}" with ${appName}! 📊\n\nNutrition Facts:\n💪 Protein: ${protein}g\n🍞 Carbs: ${carbs}g\n🥑 Fats: ${fats}g\n🔥 Calories: ${calories}\n\nHealth Score: ${healthScore}/10 ⭐\n\n${generateHashtags()}`;
  };

  // Create shareable URL
  const createShareUrl = (): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/scan/${scanId}`;
  };

  // Share to Twitter/X
  const shareToTwitter = async () => {
    setShareLoading("twitter");
    try {
      const text = createShareText();
      const url = createShareUrl();
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, "_blank", "width=550,height=420");
    } catch (error) {
      console.error("Twitter share failed:", error);
    } finally {
      setShareLoading(null);
    }
  };

  // Share to Facebook
  const shareToFacebook = async () => {
    setShareLoading("facebook");
    try {
      const url = createShareUrl();
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(facebookUrl, "_blank", "width=550,height=420");
    } catch (error) {
      console.error("Facebook share failed:", error);
    } finally {
      setShareLoading(null);
    }
  };

  // Share to LinkedIn
  const shareToLinkedIn = async () => {
    setShareLoading("linkedin");
    try {
      const text = createShareText();
      const url = createShareUrl();
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(linkedinUrl, "_blank", "width=550,height=420");
    } catch (error) {
      console.error("LinkedIn share failed:", error);
    } finally {
      setShareLoading(null);
    }
  };

  // Copy share link
  const copyShareLink = async () => {
    try {
      const url = createShareUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // Download nutrition card as image
  const downloadNutritionCard = async () => {
    setShareLoading("download");
    try {
      // Create canvas for nutrition card
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(1, "#16213e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // App branding at top
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${appLogo} ${appName}`, canvas.width / 2, 80);

      // Food name
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ff6b35";
      ctx.fillText(foodName, canvas.width / 2, 180);

      // Nutrition facts section
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "left";
      ctx.fillText("Nutrition Facts", 60, 280);

      // Draw nutrition boxes
      const boxY = 350;
      const boxWidth = 200;
      const boxHeight = 120;
      const spacing = 20;

      const nutrients = [
        { label: "Calories", value: calories, unit: "kcal", color: "#ff6b35" },
        { label: "Protein", value: protein, unit: "g", color: "#4ecdc4" },
        { label: "Carbs", value: carbs, unit: "g", color: "#f7b731" },
        { label: "Fats", value: fats, unit: "g", color: "#5f27cd" },
      ];

      nutrients.forEach((nutrient, index) => {
        const x = 60 + index * (boxWidth + spacing);

        // Box background
        ctx.fillStyle = nutrient.color;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, boxY, boxWidth, boxHeight);
        ctx.globalAlpha = 1;

        // Box border
        ctx.strokeStyle = nutrient.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, boxY, boxWidth, boxHeight);

        // Value
        ctx.fillStyle = nutrient.color;
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          nutrient.value.toString(),
          x + boxWidth / 2,
          boxY + 60
        );

        // Unit and label
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.fillText(nutrient.unit, x + boxWidth / 2, boxY + 85);
        ctx.font = "bold 16px Arial";
        ctx.fillText(nutrient.label, x + boxWidth / 2, boxY + 110);
      });

      // Health score
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Health Score", canvas.width / 2, 600);

      // Score circle
      const scoreRadius = 60;
      const scoreX = canvas.width / 2;
      const scoreY = 700;

      ctx.fillStyle = healthScore >= 8 ? "#2ecc71" : healthScore >= 5 ? "#f39c12" : "#e74c3c";
      ctx.beginPath();
      ctx.arc(scoreX, scoreY, scoreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 60px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${healthScore}/10`, scoreX, scoreY + 20);

      // User tag
      if (userName) {
        ctx.fillStyle = "#4ecdc4";
        ctx.font = "italic 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Scanned by @${userName}`, canvas.width / 2, 850);
      }

      // Website and hashtags
      ctx.fillStyle = "#95a5a6";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Visit ${appWebsite}`, canvas.width / 2, 950);
      ctx.fillText("#ScanEat #NutritionTracking #HealthyEating", canvas.width / 2, 1000);

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${foodName}-nutrition-card.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setShareLoading(null);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-white">Share Your Scan</h3>
        </div>

        {/* Share text preview */}
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {createShareText()}
          </p>
        </div>

        {/* Social media buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={shareToTwitter}
            disabled={shareLoading !== null}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <Twitter className="w-4 h-4" />
            {shareLoading === "twitter" ? "Sharing..." : "Twitter"}
          </Button>

          <Button
            onClick={shareToFacebook}
            disabled={shareLoading !== null}
            className="bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2"
          >
            <Facebook className="w-4 h-4" />
            {shareLoading === "facebook" ? "Sharing..." : "Facebook"}
          </Button>

          <Button
            onClick={shareToLinkedIn}
            disabled={shareLoading !== null}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Linkedin className="w-4 h-4" />
            {shareLoading === "linkedin" ? "Sharing..." : "LinkedIn"}
          </Button>

          <Button
            onClick={downloadNutritionCard}
            disabled={shareLoading !== null}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {shareLoading === "download" ? "Creating..." : "Download"}
          </Button>
        </div>

        {/* Copy link section */}
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 truncate">
            {createShareUrl()}
          </div>
          <Button
            onClick={copyShareLink}
            size="sm"
            variant="outline"
            className="border-slate-600 hover:bg-slate-700"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Branding footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-700">
          <p>
            Powered by {appLogo} {appName} • {appWebsite}
          </p>
        </div>
      </div>
    </Card>
  );
}
