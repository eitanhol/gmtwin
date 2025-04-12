"use client"

import { useTheme } from "next-themes"

interface EvalBarProps {
  evaluation: number
  mate?: number
  isWhiteOnBottom?: boolean
}

export function EvalBar({ evaluation, mate, isWhiteOnBottom = true }: EvalBarProps) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  // Calculate the percentage for the bar
  // For regular evaluations: 0 = equal (50%), positive = white advantage, negative = black advantage
  // For mate scores: show almost full bar in the direction of the mate
  let percentage = 50 // Default to equal position (50%)

  if (mate !== undefined) {
    // Handle mate scores - make sure we show full bar
    if (mate > 0) {
      // White is winning with mate - show full white bar (100%)
      percentage = 100
    } else if (mate < 0) {
      // Black is winning with mate - show full black bar (0%)
      percentage = 0
    } else if (mate === 0) {
      // Immediate checkmate - determine winner from evaluation
      percentage = evaluation > 0 ? 100 : 0
    }
  } else {
    // Convert evaluation to percentage (sigmoid function to keep it in bounds)
    // This formula maps evaluation to percentage:
    // eval = 0 -> 50%
    // eval = +2 -> ~88%
    // eval = -2 -> ~12%
    percentage = 100 / (1 + Math.exp(-evaluation))
  }

  // Colors for the bar
  const whiteColor = "bg-gradient-to-r from-white to-white"
  const blackColor = "bg-gradient-to-r from-gray-900 to-gray-800"

  // Text to display in the bar
  let displayText = ""
  if (mate !== undefined) {
    // Don't show M0 (which indicates immediate checkmate)
    if (mate !== 0) {
      displayText = `M${Math.abs(mate)}`
    }
  } else {
    // For negative evaluations (black advantage), show positive number with minus sign
    displayText = evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1)
  }

  return (
    <div className="flex flex-col items-center h-full">
      {/* Evaluation bar */}
      <div className="h-[calc(100%-20px)] w-6 flex flex-col relative overflow-hidden rounded-lg border border-border shadow-md">
        {/* Black's side of the bar - now at the top */}
        <div
          className={`${blackColor} w-full transition-height duration-300 ease-in-out`}
          style={{ height: `${100 - percentage}%` }}
        />

        {/* White's side of the bar - now at the bottom */}
        <div className={`${whiteColor} w-full flex-grow transition-height duration-300 ease-in-out`} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 opacity-50 pointer-events-none"></div>
      </div>

      {/* Evaluation text - now below the bar */}
      <div
        className={`text-xs font-bold mt-1 px-2 py-1 rounded-full ${
          mate !== undefined
            ? "bg-tiktok-red text-white"
            : "bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 text-foreground"
        }`}
      >
        {displayText}
      </div>
    </div>
  )
}
