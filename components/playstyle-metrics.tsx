"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlaystyleData } from "@/lib/types"
import { Sword, Target, Lightbulb, Shield, Flame, Crown } from "lucide-react"

interface PlaystyleMetricsProps {
  playstyle: PlaystyleData
  side: "white" | "black"
}

export function PlaystyleMetrics({ playstyle, side }: PlaystyleMetricsProps) {
  // Create metrics array excluding endgame if it's -1 (not available)
  const metrics = [
    {
      name: "Aggression",
      value: playstyle.aggression,
      description: "How aggressively you attack your opponent",
      icon: <Sword className="h-5 w-5 text-tiktok-red" />,
      color: "from-tiktok-red to-tiktok-purple",
    },
    {
      name: "Positional",
      value: playstyle.positional,
      description: "How much you focus on controlling the board",
      icon: <Target className="h-5 w-5 text-tiktok-purple" />,
      color: "from-tiktok-purple to-tiktok-blue",
    },
    {
      name: "Tactical",
      value: playstyle.tactical,
      description: "How well you spot and execute tactical combinations",
      icon: <Lightbulb className="h-5 w-5 text-tiktok-yellow" />,
      color: "from-tiktok-yellow to-tiktok-red",
    },
    {
      name: "Defensive",
      value: playstyle.defensive,
      description: "How well you defend against threats and maintain material",
      icon: <Shield className="h-5 w-5 text-tiktok-blue" />,
      color: "from-tiktok-blue to-tiktok-purple",
    },
    {
      name: "Risk-Taking",
      value: playstyle.riskTaking,
      description: "How willing you are to sacrifice material for initiative or attack",
      icon: <Flame className="h-5 w-5 text-tiktok-red" />,
      color: "from-tiktok-red to-tiktok-yellow",
    },
  ]

  // Only add endgame if it's available (not -1)
  if (playstyle.endgame >= 0) {
    metrics.push({
      name: "Endgame",
      value: playstyle.endgame,
      description: "How well you convert material advantages in endgame positions",
      icon: <Crown className="h-5 w-5 text-tiktok-purple" />,
      color: "from-tiktok-purple to-tiktok-blue",
    })
  }

  return (
    <div className="animate-slide-in-bottom">
      <div className="mb-6 bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 p-4 rounded-xl border border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="inline-block p-1.5 bg-gradient-to-r from-tiktok-red to-tiktok-blue rounded-full text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </span>
          {side === "white" ? "White" : "Black"} Player Skills Report
        </h2>
        <p className="text-muted-foreground ml-9">
          Analysis of your {side === "white" ? "White" : "Black"} pieces play style (or lack thereof)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric, index) => (
          <Card
            key={metric.name}
            className="tiktok-card overflow-hidden animate-slide-in-bottom"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10">
                {metric.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{metric.name}</CardTitle>
                <CardDescription>{metric.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Beginner</span>
                  <span>Grandmaster</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${metric.color} transition-all`}
                    style={{ width: `${Math.max(0, Math.min(100, metric.value * 100))}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 rounded-full text-sm font-medium">
                    {isNaN(metric.value) ? "0%" : `${Math.round(metric.value * 100)}%`}
                  </span>
                </div>
                <div className="text-xs italic text-muted-foreground text-center p-2 bg-gradient-to-r from-tiktok-red/5 to-tiktok-blue/5 rounded-lg">
                  {metric.name === "Aggression" && metric.value < 0.4 && "Even a sloth would be more aggressive."}
                  {metric.name === "Aggression" &&
                    metric.value >= 0.4 &&
                    metric.value < 0.7 &&
                    "Occasionally remembers chess is a fighting game."}
                  {metric.name === "Aggression" && metric.value >= 0.7 && "Attacks like a drunk person in a bar fight."}

                  {metric.name === "Positional" && metric.value < 0.4 && "Pieces placed randomly, as if by a toddler."}
                  {metric.name === "Positional" &&
                    metric.value >= 0.4 &&
                    metric.value < 0.7 &&
                    "Pieces occasionally found good squares... by accident."}
                  {metric.name === "Positional" &&
                    metric.value >= 0.7 &&
                    "Surprisingly decent piece placement for someone at your level."}

                  {metric.name === "Tactical" && metric.value < 0.4 && "Missed tactics that a beginner would spot."}
                  {metric.name === "Tactical" &&
                    metric.value >= 0.4 &&
                    metric.value < 0.7 &&
                    "Found some tactics, missed the important ones."}
                  {metric.name === "Tactical" &&
                    metric.value >= 0.7 &&
                    "Occasionally calculated more than one move ahead."}

                  {metric.name === "Defensive" && metric.value < 0.4 && "Defense weaker than wet tissue paper."}
                  {metric.name === "Defensive" &&
                    metric.value >= 0.4 &&
                    metric.value < 0.7 &&
                    "Occasionally remembered to defend."}
                  {metric.name === "Defensive" &&
                    metric.value >= 0.7 &&
                    "Turtled up like you're terrified of losing material."}

                  {metric.name === "Risk-Taking" && metric.value < 0.4 && "Plays chess like it's a savings account."}
                  {metric.name === "Risk-Taking" &&
                    metric.value >= 0.4 &&
                    metric.value < 0.7 &&
                    "Occasionally ventures outside comfort zone."}
                  {metric.name === "Risk-Taking" &&
                    metric.value >= 0.7 &&
                    "Sacrifices pieces like they're pawns in a pawn shop."}

                  {metric.name === "Endgame" && metric.value < 0.4 && "Endgame skills of a complete beginner."}
                  {metric.name === "Endgame" &&
                    metric.value >= 0.4 &&
                    metric.value < 0.7 &&
                    "Basic endgame knowledge, nothing special."}
                  {metric.name === "Endgame" &&
                    metric.value >= 0.7 &&
                    "Surprisingly didn't mess up the endgame too badly."}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Show explanation if endgame metric is not available */}
        {playstyle.endgame < 0 && (
          <Card
            className="tiktok-card overflow-hidden animate-slide-in-bottom"
            style={{ animationDelay: `${metrics.length * 0.1}s` }}
          >
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10">
                <Crown className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Endgame</CardTitle>
                <CardDescription>How well you convert material advantages in endgame positions</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-muted-foreground py-4 bg-gradient-to-r from-tiktok-red/5 to-tiktok-blue/5 rounded-lg">
                Endgame metric is not available because the game didn't reach move 30. Probably for the best - we've
                seen enough already.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 text-center">
        <div className="inline-block bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 p-3 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Want to improve? Try not playing like this. 😉</p>
          <p className="text-xs mt-1 text-muted-foreground">Share your skills report with #ChessStyleAnalyzer</p>
        </div>
      </div>
    </div>
  )
}
