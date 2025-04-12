"use client"

import type React from "react"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { PlaystyleData } from "@/lib/types"
import { grandmasters } from "@/lib/grandmasters"
import { Share2, Trophy, Quote, FlameIcon as Fire, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GrandmasterMatchProps {
  grandmaster: string
  playstyle: PlaystyleData
  side: "white" | "black"
}

export function GrandmasterMatch({ grandmaster, playstyle, side }: GrandmasterMatchProps) {
  const gmData = grandmasters.find((gm) => gm.id === grandmaster) || grandmasters[0]

  // Function to handle sharing
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `OMG! I play chess like ${gmData.name}! 😱`,
          text: `My chess style matches with ${gmData.name}! Find your chess twin! #ChessTwin #Chess`,
          url: window.location.href,
        })
        .catch((err) => {
          console.log("Error sharing:", err)
        })
    } else {
      alert("Share this result on social media!")
    }
  }

  // Generate a random percentage match between 87% and 99%
  const matchPercentage = Math.floor(Math.random() * (99 - 87 + 1)) + 87

  // Get a funny reason for the match
  const getMatchReason = () => {
    const reasons = [
      `You both make questionable decisions under pressure 😅`,
      `Your opponents are equally confused by your moves 🤔`,
      `You both think you're better than you actually are 💁‍♂️`,
      `Neither of you can remember opening theory 📚`,
      `You both panic when your queen is threatened 👑`,
      `Your mouse slips look like brilliant sacrifices ✨`,
      `You both pretend to calculate 10 moves ahead 🧮`,
      `Your blunders occasionally look like genius moves 🧠`,
      `You both blame the computer when you lose 💻`,
      `Your "intuition" is just as random 🔮`,
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  // Get a funny achievement quote
  const getAchievementQuote = () => {
    const achievements = [
      "Made it through a whole game without hanging your queen 👑",
      "Successfully remembered how the horsey moves 🐴",
      "Opponent resigned before you blundered your rook 🏆",
      "Accidentally found a brilliant move while panicking 🧠",
      "Survived 10+ moves without losing material 💪",
      "Promoted a pawn once (it got captured immediately) 😅",
      "Memorized one opening line (played it wrong anyway) 📚",
      "Convinced opponent you know what you're doing 🎭",
      "Calculated a whole 2 moves ahead once 🔢",
      "Learned to castle before your 50th game 🏰",
      "Recognized a fork after it happened to you 🍴",
      "Checkmated with only 3 accidental mouse slips 🖱️",
      "Played a game without asking 'wait, what just happened?' 👀",
      "Correctly identified the bishop as 'the pointy one' 🔺",
      "Managed to not lose in the first 10 moves 🎉",
      "Successfully found the en passant move (by accident) ✨",
      "Opponent thought your random move was a trap 🪤",
      "Learned what 'zugzwang' means (still can't pronounce it) 🤓",
      "Survived a queen trade without immediately resigning 💯",
      "Flagged opponent while down 15 points of material 🏁",
    ]
    return achievements[Math.floor(Math.random() * achievements.length)]
  }

  return (
    <Card className="bg-black/50 border-tiktok-red/30 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
      <div className="bg-gradient-to-r from-tiktok-red to-black p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex flex-col items-center relative z-10">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-tiktok-red/20 to-black/20 animate-pulse-slow"></div>
            <Image
              src={gmData.imagePath || "/placeholder.svg"}
              alt={gmData.name}
              width={128}
              height={128}
              quality={100}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-center">
            <div className="inline-block bg-black/30 px-3 py-1 rounded-full text-white text-sm mb-2">
              {matchPercentage}% Match! 🔥
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Your chess twin is</h2>
            <h1 className="text-4xl font-black text-white">{gmData.name}</h1>
            <p className="text-white/60 mt-1 text-sm">{gmData.years}</p>
          </div>
        </div>

        {/* Social sharing button */}
        <div className="absolute top-4 right-4">
          <Button onClick={handleShare} size="sm" className="rounded-full bg-white/20 hover:bg-white/30 text-white">
            <Share2 className="h-4 w-4" />
            <span className="sr-only pointer-events-none">Share</span>
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="bg-black/30 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Quote className="h-5 w-5 text-tiktok-red" />
              <h3 className="text-xl font-bold text-white">Playing Style</h3>
            </div>
            <p className="text-white/80">{gmData.description}</p>
            <p className="text-sm italic mt-2 text-white/60">{getMatchReason()}</p>
          </div>

          <div className="bg-black/30 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Famous Achievements</h3>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-white/80">
              {gmData.achievements.slice(0, 2).map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
            <p className="text-sm italic mt-2 text-white/60">Your achievement: {getAchievementQuote()}</p>
          </div>

          <div className="bg-black/30 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Fire className="h-5 w-5 text-tiktok-red" />
              <h3 className="text-xl font-bold text-white">Your Chess Vibe</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(playstyle)
                .filter(
                  ([key]) => key !== "openingRepertoire" && typeof playstyle[key as keyof PlaystyleData] === "number",
                )
                .slice(0, 4)
                .map(([key, value]) => (
                  <div key={key} className="bg-black/30 p-2 rounded-lg">
                    <div className="text-xs text-white/60 uppercase flex items-center gap-1">
                      {key === "aggression" && <Fire className="h-3 w-3 text-tiktok-red" />}
                      {key === "tactical" && <Zap className="h-3 w-3 text-yellow-400" />}
                      {key === "positional" && <Star className="h-3 w-3 text-blue-400" />}
                      {key === "defensive" && <Shield className="h-3 w-3 text-green-400" />}
                      {key === "riskTaking" && <Dice className="h-3 w-3 text-purple-400" />}
                      {key === "endgame" && <Target className="h-3 w-3 text-orange-400" />}
                      {key}
                    </div>
                    <div className="text-lg font-bold text-white">{Math.round((value as number) * 100)}%</div>
                  </div>
                ))}
            </div>
            <p className="text-sm italic mt-3 text-white/60 text-center">
              {Math.round(playstyle.aggression * 100) > 70
                ? "You're not aggressive, you're just bad at defense 😂"
                : Math.round(playstyle.tactical * 100) > 70
                  ? "Your 'tactics' are just hoping your opponent misses stuff 👀"
                  : "Your strategy is basically 'move pieces and pray' 🙏"}
            </p>
          </div>

          <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/10 relative overflow-hidden">
            <div className="text-center">
              <p className="text-white/80 font-bold">Share your result with #ChessTwin</p>
              <p className="text-xs text-white/60 mt-1">Tag us for a chance to be featured! 📱✨</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Import these icons for the chess vibe section
function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}

function Dice(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <path d="M16 8h.01" />
      <path d="M8 8h.01" />
      <path d="M8 16h.01" />
      <path d="M16 16h.01" />
      <path d="M12 12h.01" />
    </svg>
  )
}

function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
