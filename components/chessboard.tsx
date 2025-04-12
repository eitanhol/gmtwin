"use client"

import { useState, useEffect, useRef } from "react"
import { Chess } from "chess.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, Share2 } from "lucide-react"
import type { AnalysisResult } from "@/lib/types"
import { useTheme } from "next-themes"
import { EvalBar } from "./eval-bar"

interface ChessboardProps {
  game: Chess
  analysis: AnalysisResult
  highlightSide?: "white" | "black"
}

export function Chessboard({ game, analysis, highlightSide = "white" }: ChessboardProps) {
  const [currentPosition, setCurrentPosition] = useState<Chess>(new Chess())
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [moves, setMoves] = useState<string[]>([])
  const [previousMove, setPreviousMove] = useState<{ from: string; to: string } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!game) return

    // Extract all positions from the game
    const chess = new Chess()
    const moveHistory = game.history({ verbose: true })
    const allMoves = ["start", ...moveHistory.map((m) => `${m.from}${m.to}`)]
    setMoves(allMoves)

    // Set initial position
    setCurrentPosition(new Chess(game.fen()))
    setCurrentMoveIndex(allMoves.length - 1)

    // Set previous move for the final position
    if (moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1]
      setPreviousMove({
        from: lastMove.from,
        to: lastMove.to,
      })
    }
  }, [game])

  useEffect(() => {
    if (!boardRef.current || !currentPosition) return

    // Draw the board
    const boardElement = boardRef.current
    boardElement.innerHTML = ""

    // Create the chessboard
    const board = document.createElement("div")
    board.className =
      "grid grid-cols-8 w-full aspect-square rounded-xl overflow-hidden border-2 border-tiktok-blue/30 shadow-lg will-change-transform"

    // Get current FEN
    const fen = currentPosition.fen()
    const fenParts = fen.split(" ")
    const position = fenParts[0]
    const rows = position.split("/")

    // Determine colors based on theme
    const isDarkTheme = theme === "dark"
    const lightSquareColor = isDarkTheme ? "bg-amber-800/80" : "bg-amber-50"
    const darkSquareColor = isDarkTheme ? "bg-amber-950/80" : "bg-amber-800"
    const lightSquareHoverColor = isDarkTheme ? "bg-amber-700" : "bg-amber-200"
    const darkSquareHoverColor = isDarkTheme ? "bg-amber-900" : "bg-amber-700"

    // SVG definitions for chess pieces
    const pieceSVGs = {
      // White pieces
      P: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>`,
      R: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt"/>
        <path d="M34 14l-3 3H14l-3-3"/>
        <path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
      </g>
    </svg>`,
      N: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
        <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/>
        <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#000"/>
        <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#000"/>
      </g>
    </svg>`,
      B: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="#fff" strokeLinecap="butt">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#000" strokeLinejoin="miter"/>
      </g>
    </svg>`,
      Q: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="12" r="2.75"/>
        <circle cx="14" cy="9" r="2.75"/>
        <circle cx="22.5" cy="8" r="2.75"/>
        <circle cx="31" cy="9" r="2.75"/>
        <circle cx="39" cy="12" r="2.75"/>
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" strokeLinecap="butt"/>
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt"/>
        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/>
      </g>
    </svg>`,
      K: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter"/>
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#fff"/>
        <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/>
      </g>
    </svg>`,

      // Black pieces with the same updates
      p: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>`,
      r: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5M12 36v-4h21v4" strokeLinecap="butt"/>
        <path d="M14 29.5v-13h17v13" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M14 16.5L11 14h23l-3 2.5M11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt"/>
        <path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23" fill="none" stroke="#fff" strokeWidth="1" strokeLinejoin="miter"/>
      </g>
    </svg>`,
      n: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
        <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/>
        <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#fff" stroke="#fff"/>
        <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#fff" stroke="#fff"/>
      </g>
    </svg>`,
      b: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g strokeLinecap="butt">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
        </g>
        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" strokeLinejoin="miter"/>
      </g>
    </svg>`,
      q: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="none">
          <circle cx="6" cy="12" r="2.75"/>
          <circle cx="14" cy="9" r="2.75"/>
          <circle cx="22.5" cy="8" r="2.75"/>
          <circle cx="31" cy="9" r="2.75"/>
          <circle cx="39" cy="12" r="2.75"/>
        </g>
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" strokeLinecap="butt"/>
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt"/>
        <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" strokeLinecap="butt"/>
        <path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="#fff"/>
      </g>
    </svg>`,
      k: `<svg viewBox="0 0 45 45" width="80%" height="80%" class="mx-auto">
      <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6" strokeLinejoin="miter"/>
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#000"/>
        <path d="M20 8h5" strokeLinejoin="miter"/>
        <path d="M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.906 14 6.997 19.85c-2.497 5.65 4.853 9 4.853 9M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/>
      </g>
    </svg>`,
    }

    // Function to convert algebraic notation to row/col indices
    const algebraicToIndices = (square: string) => {
      const file = square.charCodeAt(0) - "a".charCodeAt(0)
      const rank = 8 - Number.parseInt(square[1])
      return { row: rank, col: file }
    }

    // Create the squares and pieces
    rows.forEach((row, rowIndex) => {
      let colIndex = 0

      for (let i = 0; i < row.length; i++) {
        const char = row[i]

        if (!isNaN(Number.parseInt(char))) {
          // Empty squares
          const emptyCount = Number.parseInt(char)
          for (let j = 0; j < emptyCount; j++) {
            const square = document.createElement("div")
            const isLight = (rowIndex + colIndex) % 2 === 0

            // Get algebraic notation for this square
            const file = String.fromCharCode("a".charCodeAt(0) + colIndex)
            const rank = 8 - rowIndex
            const squareName = `${file}${rank}`

            // Check if this square is part of the previous move
            const isFromSquare = previousMove && previousMove.from === squareName
            const isToSquare = previousMove && previousMove.to === squareName
            const isHighlighted = isFromSquare || isToSquare

            // Apply appropriate color based on square color and highlight status
            const bgColor = isHighlighted
              ? "bg-gradient-to-r from-tiktok-yellow/70 to-tiktok-yellow/70"
              : isLight
                ? lightSquareColor
                : darkSquareColor

            square.className = `aspect-square flex items-center justify-center ${bgColor} transition-all duration-200`

            // Add hover effect to highlight squares
            square.addEventListener("mouseenter", () => {
              if (!isHighlighted) {
                square.classList.add(isLight ? lightSquareHoverColor : darkSquareHoverColor)
              }
            })
            square.addEventListener("mouseleave", () => {
              if (!isHighlighted) {
                square.classList.remove(isLight ? lightSquareHoverColor : darkSquareHoverColor)
                square.classList.add(isLight ? lightSquareColor : darkSquareColor)
              }
            })

            board.appendChild(square)
            colIndex++
          }
        } else {
          // Square with piece
          const square = document.createElement("div")
          const isLight = (rowIndex + colIndex) % 2 === 0

          // Get algebraic notation for this square
          const file = String.fromCharCode("a".charCodeAt(0) + colIndex)
          const rank = 8 - rowIndex
          const squareName = `${file}${rank}`

          // Check if this square is part of the previous move
          const isFromSquare = previousMove && previousMove.from === squareName
          const isToSquare = previousMove && previousMove.to === squareName
          const isHighlighted = isFromSquare || isToSquare

          // Apply appropriate color based on square color and highlight status
          const bgColor = isHighlighted
            ? "bg-gradient-to-r from-tiktok-yellow/70 to-tiktok-yellow/70"
            : isLight
              ? lightSquareColor
              : darkSquareColor

          // Determine if this piece belongs to the highlighted side
          const isPieceWhite = char === char.toUpperCase()
          const isHighlightedPiece =
            (isPieceWhite && highlightSide === "white") || (!isPieceWhite && highlightSide === "black")

          // Add highlight for the selected side's pieces
          square.className = `aspect-square flex items-center justify-center ${bgColor} transition-all duration-200`

          // Add hover effect to highlight squares
          square.addEventListener("mouseenter", () => {
            if (!isHighlighted) {
              square.classList.add(isLight ? lightSquareHoverColor : darkSquareHoverColor)
            }
          })
          square.addEventListener("mouseleave", () => {
            if (!isHighlighted) {
              square.classList.remove(isLight ? lightSquareHoverColor : darkSquareHoverColor)
              square.classList.add(isLight ? lightSquareColor : darkSquareColor)
            }
          })

          // Add the SVG piece with animation if it's the highlighted side
          if (pieceSVGs[char]) {
            const pieceContainer = document.createElement("div")
            // Only animate some pieces to improve performance
            pieceContainer.className = `flex items-center justify-center w-full h-full`
            pieceContainer.innerHTML = pieceSVGs[char]
            square.appendChild(pieceContainer)
          }

          board.appendChild(square)
          colIndex++
        }
      }
    })

    boardElement.appendChild(board)

    // Add evaluation if available
    // Update the evaluation display logic to only show game status text
    if (analysis && analysis.positions[currentMoveIndex]) {
      const evalElement = document.createElement("div")
      evalElement.className = "mt-4 text-center text-foreground"

      // Get the position and evaluation
      const position = analysis.positions[currentMoveIndex]
      const evaluation = position.evaluation

      // Check if the game is over
      const isGameOver = currentPosition.isGameOver()

      // Get game result from header
      const header = game.header()
      const gameResult = header.Result || ""

      // Check if we're at the final position
      const isLastMove = currentMoveIndex === moves.length - 1

      // Determine game status text
      let gameStatusText = ""

      if (isGameOver) {
        // Game is over due to checkmate or draw
        if (currentPosition.isCheckmate()) {
          const winner = currentPosition.turn() === "w" ? "Black" : "White"
          gameStatusText = `Game Over: Checkmate - ${winner} wins`

          // Set mate value to 0 for immediate checkmate
          if (!position.mate) {
            position.mate = 0
          }
        } else if (currentPosition.isDraw()) {
          if (currentPosition.isStalemate()) {
            gameStatusText = `Game Over: Draw by stalemate`
          } else if (currentPosition.isThreefoldRepetition()) {
            gameStatusText = `Game Over: Draw by threefold repetition`
          } else if (currentPosition.isInsufficientMaterial()) {
            gameStatusText = `Game Over: Draw by insufficient material`
          } else {
            gameStatusText = `Game Over`
          }
        } else {
          gameStatusText = `Game Over`
        }
      } else if (isLastMove) {
        // We're at the last move but game isn't technically over
        // Check the game result to determine if it was resignation, time forfeit, etc.
        if (gameResult === "1-0" && !currentPosition.isCheckmate()) {
          // Check for time forfeit in the termination header
          if (header.Termination && header.Termination.toLowerCase().includes("time")) {
            gameStatusText = "Game Over: White wins on time"
          } else {
            gameStatusText = "Game Over: Black resigned"
          }
        } else if (gameResult === "0-1" && !currentPosition.isCheckmate()) {
          // Check for time forfeit in the termination header
          if (header.Termination && header.Termination.toLowerCase().includes("time")) {
            gameStatusText = "Game Over: Black wins on time"
          } else {
            gameStatusText = "Game Over: White resigned"
          }
        } else if (gameResult === "1/2-1/2" && !currentPosition.isDraw()) {
          gameStatusText = "Game Over: Draw by agreement"
        }
      }

      // Only show game status text if the gamee is over
      if (gameStatusText) {
        evalElement.innerHTML = `<div class="inline-block bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 px-4 py-2 rounded-full font-medium">${gameStatusText}</div>`
        boardElement.appendChild(evalElement)
      }
    }
  }, [currentPosition, currentMoveIndex, analysis, highlightSide, theme, game, previousMove])

  const goToMove = (index: number) => {
    if (index < 0 || index >= moves.length) return

    const chess = new Chess()

    // Replay the game up to the selected move
    for (let i = 1; i <= index; i++) {
      const move = moves[i]
      const from = move.substring(0, 2)
      const to = move.substring(2, 4)
      chess.move({ from, to, promotion: "q" })
    }

    // Set the previous move for highlighting
    if (index > 0) {
      const moveStr = moves[index]
      const from = moveStr.substring(0, 2)
      const to = moveStr.substring(2, 4)
      setPreviousMove({ from, to })
    } else {
      setPreviousMove(null)
    }

    setCurrentPosition(chess)
    setCurrentMoveIndex(index)
  }

  // Get the move history with highlighting for the selected side
  const moveHistory = game.history({ verbose: true })

  // Get current position evaluation for the eval bar
  const currentEvaluation = analysis?.positions[currentMoveIndex]?.evaluation || 0
  const currentMate = analysis?.positions[currentMoveIndex]?.mate

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
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
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          </span>
          Analyzing {highlightSide === "white" ? "White" : "Black"} Player's Moves
        </h3>
      </div>

      <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-tiktok-red/5 to-tiktok-blue/5 p-4 rounded-xl border border-border">
        {/* Evaluation bar */}
        <div className="h-[400px] flex flex-col justify-center">
          <EvalBar evaluation={currentEvaluation} mate={currentMate} />
        </div>

        {/* Chessboard */}
        <div ref={boardRef} className="w-full max-w-md"></div>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToMove(0)}
          disabled={currentMoveIndex === 0}
          className="rounded-full bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 hover:from-tiktok-red/20 hover:to-tiktok-blue/20"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToMove(currentMoveIndex - 1)}
          disabled={currentMoveIndex === 0}
          className="rounded-full bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 hover:from-tiktok-red/20 hover:to-tiktok-blue/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToMove(currentMoveIndex + 1)}
          disabled={currentMoveIndex === moves.length - 1}
          className="rounded-full bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 hover:from-tiktok-red/20 hover:to-tiktok-blue/20"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToMove(moves.length - 1)}
          disabled={currentMoveIndex === moves.length - 1}
          className="rounded-full bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 hover:from-tiktok-red/20 hover:to-tiktok-blue/20"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4">
        <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute inset-0 bg-gradient-to-r from-tiktok-red to-tiktok-blue transition-all"
            style={{ width: `${(currentMoveIndex / (moves.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card className="tiktok-card overflow-hidden">
        <CardContent className="pt-6 h-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {moveHistory.map((move, index) => {
              const isPlayerMove =
                (move.color === "w" && highlightSide === "white") || (move.color === "b" && highlightSide === "black")

              // Get position and evaluation for this move
              const position = analysis.positions[index + 1]
              const evaluation = position?.evaluation || 0
              const mate = position?.mate

              // Check if this is a checkmate move (indicated by # in SAN)
              const isCheckmate = move.san.includes("#")

              return (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-all hover:bg-gradient-to-r hover:from-tiktok-red/10 hover:to-tiktok-blue/10
                    ${index === currentMoveIndex - 1 ? "bg-gradient-to-r from-tiktok-red/20 to-tiktok-blue/20 font-bold" : ""}
                    ${isPlayerMove ? "border-l-2 border-tiktok-yellow" : ""}
                  `}
                  onClick={() => goToMove(index + 1)}
                >
                  {Math.floor(index / 2) + 1}.{index % 2 === 0 ? "" : ".."} {move.san}
                  {analysis && position && (
                    <span
                      className={`text-xs ml-1 ${mate !== undefined && !isCheckmate && mate !== 0 ? "text-tiktok-red" : "text-muted-foreground"}`}
                    >
                      {mate !== undefined && !isCheckmate && mate !== 0
                        ? `(M${Math.abs(mate)})`
                        : !isCheckmate
                          ? `(${evaluation > 0 ? "+" : ""}${evaluation.toFixed(1)})`
                          : ""}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 hover:from-tiktok-red/20 hover:to-tiktok-blue/20 flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Analysis
        </Button>
      </div>
    </div>
  )
}
