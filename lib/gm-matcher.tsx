import type { PlaystyleData } from "./types"
import { grandmasters } from "./grandmasters"

export function findMatchingGrandmaster(playstyle: PlaystyleData): string {
  // Log the input playstyle for debugging
  console.log("Player playstyle for matching:", playstyle)

  // Calculate similarity scores using Manhattan distance
  const scores = grandmasters.map((gm) => {
    const distance = calculateManhattanDistance(playstyle, gm.playstyle)
    const similarity = 1 / (1 + distance)
    return {
      id: gm.id,
      name: gm.name,
      score: similarity,
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
  console.log("Detailed GM Matching Scores:", scores.map(s => ({
    name: s.name,
    score: s.score.toFixed(3),
    differences: Object.entries(s.differences)
      .map(([key, val]) => `${key}: ${val.toFixed(2)}`)
      .join(", "),
  })))

  // Sort the scores from highest similarity to lowest
  scores.sort((a, b) => b.score - a.score)

  // Determine all candidates that are within 85% of the best match's score.
  const bestScore = scores[0].score
  const candidates = scores.filter(match => match.score >= bestScore * 0.85)

  // If multiple candidates are nearly equally matched, select deterministically.
  if (candidates.length > 1) {
    // Create a deterministic sum from the playstyle
    const styleSum =
      playstyle.aggression * 10 +
      playstyle.positional * 7 +
      playstyle.tactical * 5 +
      playstyle.defensive * 3 +
      playstyle.riskTaking * 11 +
      playstyle.endgame * 2

    // Use the fractional part to index among candidates.
    const index = Math.floor((styleSum % 1) * candidates.length)

    // Avoid Anand if possible when another candidate is available.
    if (candidates[index].id === "anand" && candidates.length > 1) {
      const filtered = candidates.filter(c => c.id !== "anand")
      const newIndex = Math.floor((styleSum % 1) * filtered.length)
      console.log(`Avoiding Anand, selected: ${filtered[newIndex].name}`)
      return filtered[newIndex].id
    } else {
      console.log(`Selected GM match (deterministic selection): ${candidates[index].name}`)
      return candidates[index].id
    }
  }

  // Fallback: return the best match if no close alternatives are available.
  console.log(`Selected GM match: ${scores[0].name}`)
  return scores[0].id
}

// Compute the weighted Manhattan distance between two playstyle profiles.
function calculateManhattanDistance(style1: PlaystyleData, style2: PlaystyleData): number {
  const weights = {
    aggression: 1.5,
    positional: 1.5,
    tactical: 1.5,
    defensive: 1.2,
    riskTaking: 1.5,
    endgame: 1.3,
  }

  return (
    weights.aggression * Math.abs(style1.aggression - style2.aggression) +
    weights.positional * Math.abs(style1.positional - style2.positional) +
    weights.tactical * Math.abs(style1.tactical - style2.tactical) +
    weights.defensive * Math.abs(style1.defensive - style2.defensive) +
    weights.riskTaking * Math.abs(style1.riskTaking - style2.riskTaking) +
    weights.endgame * Math.abs(style1.endgame - style2.endgame)
  )
}
