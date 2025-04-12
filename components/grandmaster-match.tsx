"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { PlaystyleData } from "@/lib/types"
import { grandmasters } from "@/lib/grandmasters"
import { Share2, Camera, Trophy, Quote, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GrandmasterMatchProps {
  grandmaster: string
  playstyle: PlaystyleData
  side: "white" | "black"
}

export function GrandmasterMatch({ grandmaster, playstyle, side }: GrandmasterMatchProps) {
  const gmData = grandmasters.find((gm) => gm.id === grandmaster) || grandmasters[0]

  // Function to handle sharing (would need to be implemented with actual sharing functionality)
  const handleShare = () => {
    alert("Share this result on social media! (This would open a share dialog in a real implementation)")
  }

  // Function to handle screenshot (would need to be implemented with actual screenshot functionality)
  const handleScreenshot = () => {
    alert("Take a screenshot to share! (This would trigger a screenshot in a real implementation)")
  }

  return (
    <Card className="tiktok-card overflow-hidden">
      <div className="bg-gradient-to-r from-tiktok-red via-tiktok-purple to-tiktok-blue p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-r from-tiktok-red/20 to-tiktok-blue/20 animate-pulse-glow"></div>
            <Image
              src={gmData.imagePath || "/placeholder.svg"}
              alt={gmData.name}
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-center md:text-left">
            <div className="inline-block bg-black/30 px-3 py-1 rounded-full text-white text-sm mb-2">
              {side === "white" ? "White" : "Black"} Player Analysis
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Your play is like</h2>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">{gmData.name}</h1>
            <p className="text-white/80 mt-1">{gmData.years}</p>
          </div>
        </div>

        {/* Social sharing buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button onClick={handleShare} size="sm" className="rounded-full bg-white/20 hover:bg-white/30 text-white">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleScreenshot}
            size="sm"
            className="rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-tiktok-red/5 to-tiktok-blue/5 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Quote className="h-5 w-5 text-tiktok-purple" />
              <h3 className="text-xl font-bold text-foreground">Playing Style</h3>
            </div>
            <p className="text-muted-foreground">{gmData.description}</p>
          </div>

          <div className="bg-gradient-to-r from-tiktok-blue/5 to-tiktok-purple/5 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-tiktok-yellow" />
              <h3 className="text-xl font-bold text-foreground">Famous Achievements</h3>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {gmData.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
            <p className="text-sm italic mt-2 text-muted-foreground">
              (Don't worry, no one's expecting you to achieve any of these in this lifetime.)
            </p>
          </div>

          <div className="bg-gradient-to-r from-tiktok-purple/5 to-tiktok-red/5 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-tiktok-red" />
              <h3 className="text-xl font-bold text-foreground">Why You Match</h3>
            </div>
            <p className="text-muted-foreground">
              Your {side === "white" ? "White" : "Black"} playstyle vaguely resembles {gmData.name}'s if you squint
              really hard and ignore the
              {playstyle.aggression > 0.6 ? " occasional random attacks" : " complete lack of aggression"} (
              {Math.round(playstyle.aggression * 100)}%) and
              {playstyle.tactical > 0.6
                ? " those tactics you stumbled into by accident"
                : " all those tactics you missed"}{" "}
              ({Math.round(playstyle.tactical * 100)}%).
              {playstyle.positional > 0.6
                ? " You somehow managed to place your pieces on reasonable squares, "
                : " Your pieces were generally in the wrong places, "}
              and your{" "}
              {playstyle.riskTaking > 0.5
                ? "reckless sacrifices that probably weren't sound"
                : "extreme caution that borders on cowardice"}
              , bears a passing resemblance to {gmData.name}'s style... if you ignore the 2000+ rating points between
              you.
            </p>
          </div>

          <div className="bg-gradient-to-r from-tiktok-red/5 to-tiktok-blue/5 rounded-xl p-4 border border-border">
            <h3 className="text-xl font-bold mb-2 text-foreground">Famous Game</h3>
            <p className="text-muted-foreground">{gmData.famousGame}</p>
            <p className="text-sm italic mt-2 text-muted-foreground">
              (Maybe study this instead of whatever you were doing in your game.)
            </p>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-tiktok-red/10 via-tiktok-purple/10 to-tiktok-blue/10 rounded-xl border border-border relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full"></div>

            <p className="text-sm text-center italic relative z-10">
              Disclaimer: Any similarity between your play and {gmData.name}'s is purely coincidental and should not be
              mentioned in your chess club. Our algorithm is legally required to match you with someone.
            </p>

            {/* Social proof */}
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>👑 Join 100K+ players who've discovered their GM match!</p>
              <p className="mt-1">📱 Share your results with #ChessStyleAnalyzer</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
