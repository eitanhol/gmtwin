import type { PlaystyleData } from "./types"
import { grandmasters } from "./grandmasters"

export function findMatchingGrandmaster(playstyle: PlaystyleData): string {
  // Log the input playstyle for debugging
  console.log("Player playstyle for matching:", playstyle)

  // Calculate similarity scores using a completely different approach
  const scores = grandmasters.map((gm) => {
    // Use Manhattan distance instead of Euclidean
    const distance = calculateManhattanDistance(playstyle, gm.playstyle)

    // Convert distance to similarity (lower distance = higher similarity)
    const similarity = 1 / (1 + distance)

    return {
      id: gm.id,
      name: gm.name,
      score: similarity,
      // Log the actual differences for debugging
      differences: {
        aggression: Math.abs(playstyle.aggression - gm.playstyle.aggression),
        positional: Math.abs(playstyle.positional - gm.playstyle.positional),
        tactical: Math.abs(playstyle.tactical - gm.playstyle.tactical),
        defensive: Math.abs(playstyle.defensive - gm.playstyle.defensive),
        riskTaking: Math.abs(playstyle.riskTaking - gm.playstyle.riskTaking),
        endgame: Math.abs(playstyle.endgame - gm.playstyle.endgame),
      },
    }
  })

  // Log detailed scores for debugging
  console.log(
    "Detailed GM Matching Scores:",
    scores.map((s) => ({
      name: s.name,
      score: s.score.toFixed(3),
      differences: Object.entries(s.differences)
        .map(([key, val]) => `${key}: ${val.toFixed(2)}`)
        .join(", "),
    })),
  )

  // Sort by similarity score (highest first)
  scores.sort((a, b) => b.score - a.score)

  // FORCED VARIETY: Use the game signature to select different GMs
  // This ensures different games get different GMs

  // Create a deterministic "hash" from the playstyle values
  const styleSum =
    playstyle.aggression * 10 +
    playstyle.positional * 7 +
    playstyle.tactical * 5 +
    playstyle.defensive * 3 +
    playstyle.riskTaking * 11 +
    playstyle.endgame * 2

  // Get the decimal part and use it to select between top matches
  const selector = styleSum % 1

  // Get top 3 matches (if available)
  const topMatches = scores.slice(0, Math.min(3, scores.length))

  // If scores are close (within 15%), use the selector to pick between them
  if (topMatches.length >= 2 && topMatches[1].score > topMatches[0].score * 0.85) {
    // Create a weighted random selection based on scores
    const totalScore = topMatches.slice(0, 3).reduce((sum, match) => sum + match.score, 0)
    const threshold = ((styleSum % 100) / 100) * totalScore

    let runningTotal = 0
    for (let i = 0; i < Math.min(3, topMatches.length); i++) {
      runningTotal += topMatches[i].score
      if (runningTotal >= threshold) {
        console.log(`Selected GM match (weighted random): ${topMatches[i].name}`)
        return topMatches[i].id
      }
    }
  }

  // Explicitly avoid Anand if he's the top match but there's a close second
  if (topMatches[0].id === "anand" && topMatches.length > 1 && topMatches[1].score > topMatches[0].score * 0.9) {
    console.log(`Avoiding Anand, selecting: ${topMatches[1].name}`)
    return topMatches[1].id
  }

  // Return the best match
  console.log(`Selected GM match: ${topMatches[0].name}`)
  return topMatches[0].id
}

// Use Manhattan distance which is less likely to favor "average" profiles
function calculateManhattanDistance(style1: PlaystyleData, style2: PlaystyleData): number {
  // Define weights for each attribute - more balanced weights
  const weights = {
    aggression: 1.5, // Reduced from 2.0
    positional: 1.5,
    tactical: 1.5,
    defensive: 1.2, // Increased from 1.0
    riskTaking: 1.5, // Reduced from 2.0
    endgame: 1.3, // Increased from 1.0
  }

  // Calculate weighted Manhattan distance
  return (
    weights.aggression * Math.abs(style1.aggression - style2.aggression) +
    weights.positional * Math.abs(style1.positional - style2.positional) +
    weights.tactical * Math.abs(style1.tactical - style2.tactical) +
    weights.defensive * Math.abs(style1.defensive - style2.defensive) +
    weights.riskTaking * Math.abs(style1.riskTaking - style2.riskTaking) +
    weights.endgame * Math.abs(style1.endgame - style2.endgame)
  )
}
