import type { Chess } from "chess.js"
import type { AnalysisResult, PlaystyleData } from "./types"

// Update the function to accept a side parameter
export function calculatePlaystyle(
  game: Chess,
  analysis: AnalysisResult,
  side: "white" | "black" = "white",
): PlaystyleData {
  // Extract game moves and filter by side
  const moves = game.history({ verbose: true })
  const sideMoves = moves.filter((move) => {
    const isWhite = move.color === "w"
    return side === "white" ? isWhite : !isWhite
  })

  // Get positions from analysis
  const positions = analysis.positions

  // Calculate the penalty per mistake based on the number of player moves
  const penaltyPerMistake = 1 / sideMoves.length

  console.log(`Player has ${sideMoves.length} moves. Penalty per mistake: ${penaltyPerMistake}`)

  // Initialize counters
  let captures = 0
  let checks = 0
  let pawnMoves = 0
  let knightMoves = 0
  let bishopMoves = 0
  let rookMoves = 0
  let queenMoves = 0
  let kingMoves = 0
  let centerControl = 0
  let castled = false
  let developedPieces = 0
  let attackingMoves = 0
  let defensiveMoves = 0
  let materialSacrificesMade = 0

  // Initialize metrics at 100%
  let aggressionMetric = 1.0
  let positionalMetric = 1.0
  let tacticalMetric = 1.0
  let defensiveMetric = 1.0
  let riskTakingMetric = 1.0
  let endgameMetric = 1.0

  // Track evaluation changes
  let prevEval = positions[0]?.evaluation || 0
  let moveIndex = 0

  // Analyze each move for the selected side
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]
    const isPlayerMove = (move.color === "w" && side === "white") || (move.color === "b" && side === "black")
    const moveNumber = Math.floor(i / 2) + 1 // Calculate the actual move number (1-based)

    if (isPlayerMove) {
      moveIndex++

      // Check if this move is in the endgame phase
      const isEndgameMove = moveNumber > 30

      // Track evaluation changes
      if (i + 1 < positions.length) {
        const currentEval = positions[i + 1].evaluation
        // For black, positive eval change is good (opposite of white)
        const evalChange = side === "white" ? currentEval - prevEval : prevEval - currentEval

        // Check for material sacrifices (significant drop in evaluation followed by improvement)
        if (evalChange < -1.0 && i + 2 < positions.length) {
          const nextEval = positions[i + 2].evaluation - currentEval
          if ((side === "white" && nextEval > 0.5) || (side === "black" && nextEval < -0.5)) {
            materialSacrificesMade++
          }
        }

        // Check if move turned advantage over to opponent
        if (evalChange < 0) {
          // This move turned advantage over to opponent
          // Apply penalties to relevant metrics based on the context of the move

          // Tactical penalty - all advantage-losing moves are tactical mistakes
          tacticalMetric -= penaltyPerMistake

          // Determine which other metrics to penalize based on move context
          if (move.piece === "p" || centerControl > 0 || moveNumber < 15) {
            // Positional penalty for pawn moves, center control, or opening moves
            positionalMetric -= penaltyPerMistake
          }

          if (move.san?.includes("+") || move.flags?.includes("c") || defensiveMoves > 0) {
            // Defensive penalty for checks, captures, or after defensive moves
            defensiveMetric -= penaltyPerMistake
          }

          if (attackingMoves > 0 || move.captured) {
            // Aggression penalty for attacking moves or captures
            aggressionMetric -= penaltyPerMistake
          }

          if (Math.abs(evalChange) > 0.8) {
            // Risk-taking penalty for significant eval changes
            riskTakingMetric -= penaltyPerMistake
          }

          if (isEndgameMove) {
            // Endgame penalty for moves in the endgame phase
            endgameMetric -= penaltyPerMistake
          }
        }

        prevEval = currentEval
      }

      // Check if this move is in the top 3 engine moves
      // We can't directly check this with our current analysis structure,
      // but we can approximate by checking if the move maintains or improves position

      // Count piece movements
      switch (move.piece) {
        case "p":
          pawnMoves++
          break
        case "n":
          knightMoves++
          // Check if knight is developed from starting position
          if (
            (side === "white" && (move.from === "b1" || move.from === "g1")) ||
            (side === "black" && (move.from === "b8" || move.from === "g8"))
          ) {
            developedPieces++
          }
          break
        case "b":
          bishopMoves++
          // Check if bishop is developed from starting position
          if (
            (side === "white" && (move.from === "c1" || move.from === "f1")) ||
            (side === "black" && (move.from === "c8" || move.from === "f8"))
          ) {
            developedPieces++
          }
          break
        case "r":
          rookMoves++
          break
        case "q":
          queenMoves++
          break
        case "k":
          kingMoves++
          break
      }

      // Check for captures
      if (move.captured) {
        captures++
      }

      // Check for checks
      if (move.san?.includes("+")) {
        checks++
      }

      // Check for castling
      if (move.san === "O-O" || move.san === "O-O-O") {
        castled = true
      }

      // Check for center control (moves to e4, d4, e5, d5)
      if (["e4", "d4", "e5", "d5"].includes(move.to)) {
        centerControl++
      }

      // Classify moves as attacking or defensive
      if (move.captured || move.san?.includes("+") || move.san?.includes("#")) {
        attackingMoves++
      } else if (move.san === "O-O" || move.san === "O-O-O" || move.piece === "k") {
        defensiveMoves++
      }
    }
  }

  // Check if we reached the endgame (move 30)
  // In chess notation, move 30 would be after 60 half-moves (30 for each player)
  const reachedEndgame = moves.length >= 60

  // Create a unique game signature for deterministic variation
  const gameSignature =
    sideMoves.length * 13 +
    captures * 17 +
    checks * 19 +
    (castled ? 23 : 0) +
    developedPieces * 29 +
    materialSacrificesMade * 31

  // Use this to create a deterministic "style profile" that varies significantly between games
  const styleProfile = gameSignature % 8 // 0-7 different style profiles

  // Log the style profile for debugging
  console.log(`Game signature: ${gameSignature}, Style profile: ${styleProfile}`)

  // Compile the metrics
  const metrics = {
    aggression: aggressionMetric,
    positional: positionalMetric,
    tactical: tacticalMetric,
    defensive: defensiveMetric,
    riskTaking: riskTakingMetric,
    endgame: reachedEndgame ? endgameMetric : -1,
  }

  // Log raw metrics for debugging
  console.log("Raw metrics before style adjustments:", metrics)

  // Apply style profile adjustments to create more extreme and varied metrics
  let finalMetrics: PlaystyleData

  switch (styleProfile) {
    case 0: // Aggressive Attacker (Tal-like)
      finalMetrics = {
        aggression: metrics.aggression * 1.2,
        positional: metrics.positional * 0.9,
        tactical: metrics.tactical * 1.1,
        defensive: metrics.defensive * 0.8,
        riskTaking: metrics.riskTaking * 1.3,
        endgame: metrics.endgame >= 0 ? metrics.endgame * 0.9 : -1,
        openingRepertoire: determineOpenings(moves.map((m) => m.san || "").join(" "), side),
      }
      break

    case 1: // Positional Player (Karpov-like)
      finalMetrics = {
        aggression: metrics.aggression * 0.8,
        positional: metrics.positional * 1.2,
        tactical: metrics.tactical * 0.9,
        defensive: metrics.defensive * 1.2,
        riskTaking: metrics.riskTaking * 0.7,
        endgame: metrics.endgame >= 0 ? metrics.endgame * 1.1 : -1,
        openingRepertoire: determineOpenings(moves.map((m) => m.san || "").join(" "), side),
      }
      break

    case 2: // Universal Player (Carlsen-like)
      finalMetrics = {
        aggression: metrics.aggression * 0.95,
        positional: metrics.positional * 1.1,
        tactical: metrics.tactical * 1.05,
        defensive: metrics.defensive * 1.1,
        riskTaking: metrics.riskTaking * 0.9,
        endgame: metrics.endgame >= 0 ? metrics.endgame * 1.2 : -1,
        openingRepertoire: determineOpenings(moves.map((m) => m.san || "").join(" "), side),
      }
      break

    case 3: // Tactical Genius (Fischer-like)
      finalMetrics = {
        aggression: metrics.aggression * 1.05,
        positional: metrics.positional * 1.05,
        tactical: metrics.tactical * 1.2,
        defensive: metrics.defensive * 0.95,
        riskTaking: metrics.riskTaking * 1.0,
        endgame: metrics.endgame >= 0 ? metrics.endgame * 1.1 : -1,
        openingRepertoire: determineOpenings(moves.map((m) => m.san || "").join(" "), side),
      }
      break

    case 4: // Defensive Specialist (Petrosian-like)
      finalMetrics = {
        aggression: metrics.aggression * 0.8,
        positional: metrics.positional * 1.1,
        tactical: metrics.tactical * 0.9,
        defensive: metrics.defensive * 1.3,
        riskTaking: metrics.riskTaking * 0.7,
        endgame: metrics.endgame >= 0 ? metrics.endgame * 1.05 : -1,
        openingRepertoire: determineOpenings(moves.map((m) => m.san || "").join(" "), side),
      }
      break

    case 5: // Classical Player (Capablanca-like)
      finalMetrics = {
        aggression: metrics.aggression * 0.8,
        positional: metrics.positional * 1.2,
        tactical: metrics.tactical * 0.95,
        defensive: metrics.defensive * 1.1,
        riskTaking: metrics.riskTaking * 0.7,
        endgame: metrics.endgame >= 0 ? metrics.endgame * 1.2 : -1,
        openingRepertoire: determineOpenings(moves.map((m) => m.san || "").join(" "), side),
      }
      break

    case 6: // Dynamic Player (Kasparov-like)
      finalMetrics = {
        aggression: metrics.aggression * 1.1,
        positional: metrics.positional * 1.05,
        tactical: metrics.tactical * 1.1,
        defensive: metrics.defensive * 0.9,
        riskTaking: metrics.riskTaking * 1.1,
        endgame: metrics.endgame >= 0 ? metrics.endgame * 0.95 : -1,
        openingRepertoire: determineOpenings(moves.map((m) => m.san || "").join(" "), side),
      }
      break

    case 7: // Solid Technical Player (Kramnik-like)
      finalMetrics = {
        aggression: metrics.aggression * 0.85,
        positional: metrics.positional * 1.1,
        tactical: metrics.tactical * 1.05,
        defensive: metrics.defensive * 1.1,
        riskTaking: metrics.riskTaking * 0.8,
        endgame: metrics.endgame >= 0 ? metrics.endgame * 1.1 : -1,
        openingRepertoire: determineOpenings(moves.map((m) => m.san || "").join(" "), side),
      }
      break

    default: // Balanced player (fallback)
      finalMetrics = {
        aggression: metrics.aggression,
        positional: metrics.positional,
        tactical: metrics.tactical,
        defensive: metrics.defensive,
        riskTaking: metrics.riskTaking,
        endgame: metrics.endgame,
        openingRepertoire: determineOpenings(moves.map((m) => m.san || "").join(" "), side),
      }
  }

  // Ensure no metric goes below 0.1 (10%) for display purposes
  // But don't cap the upper limit - allow metrics to go above 100% if the calculation results in that
  Object.keys(finalMetrics).forEach((key) => {
    if (
      key !== "openingRepertoire" &&
      finalMetrics[key as keyof PlaystyleData] < 0.1 &&
      finalMetrics[key as keyof PlaystyleData] >= 0
    ) {
      ;(finalMetrics as any)[key] = 0.1
    }
  })

  // Log the calculated metrics for debugging
  console.log("Final playstyle metrics:", finalMetrics)

  return finalMetrics
}

// Helper function to count pieces in a position
function countPieces(fen: string): number {
  const position = fen.split(" ")[0]
  let count = 0

  for (const char of position) {
    if (/[pnbrqkPNBRQK]/.test(char)) {
      count++
    }
  }

  return count
}

// Update the function to consider the side
function determineOpenings(openingMoves: string, side: "white" | "black"): string[] {
  // Simple deterministic opening detection
  if (side === "white") {
    if (openingMoves.includes("e4 e5")) {
      return ["Open Game", "Italian Game", "Ruy Lopez"]
    } else if (openingMoves.includes("e4 c5")) {
      return ["Sicilian Defense (as White)"]
    } else if (openingMoves.includes("d4 d5")) {
      return ["Queen's Gambit", "Closed Games"]
    } else if (openingMoves.includes("d4 Nf6")) {
      return ["Indian Defense Systems (as White)"]
    } else if (openingMoves.includes("c4")) {
      return ["English Opening"]
    } else if (openingMoves.includes("Nf3")) {
      return ["Reti Opening", "Flexible Systems"]
    } else {
      return ["Flexible Opening Repertoire"]
    }
  } else {
    // Black openings
    if (openingMoves.includes("e4 e5")) {
      return ["Open Game (as Black)", "Two Knights Defense"]
    } else if (openingMoves.includes("e4 c5")) {
      return ["Sicilian Defense"]
    } else if (openingMoves.includes("e4 e6")) {
      return ["French Defense"]
    } else if (openingMoves.includes("e4 c6")) {
      return ["Caro-Kann Defense"]
    } else if (openingMoves.includes("d4 d5")) {
      return ["Queen's Gambit Declined", "Slav Defense"]
    } else if (openingMoves.includes("d4 Nf6")) {
      return ["Indian Defense", "King's Indian", "Nimzo-Indian"]
    } else {
      return ["Flexible Defense Repertoire"]
    }
  }
}
