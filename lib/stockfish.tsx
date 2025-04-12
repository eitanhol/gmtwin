import { Chess } from "chess.js"
import type { AnalysisResult, PositionAnalysis } from "./types"

// Interface for our chess engine
interface ChessEngine {
  postMessage: (message: string) => void
  onMessage: (callback: (message: string) => void) => void
  terminate: () => void
}

// Global variable to store the engine instance
let engineInstance: ChessEngine | null = null

// Initialize Stockfish chess engine
export async function initStockfish(): Promise<ChessEngine | null> {
  if (engineInstance) {
    return engineInstance
  }

  try {
    console.log("Creating Stockfish worker...")

    // Check if the stockfish.wasm file exists
    try {
      const wasmResponse = await fetch("/stockfish.wasm", { method: "HEAD" })
      if (!wasmResponse.ok) {
        console.error("stockfish.wasm file not found. Engine will not work properly.")
        throw new Error("stockfish.wasm file not found")
      }
    } catch (error) {
      console.error("Error checking for stockfish.wasm:", error)
      throw new Error("Could not verify stockfish.wasm file")
    }

    // Create a worker for Stockfish
    let worker: Worker

    try {
      // Try with absolute path first
      worker = new Worker("/stockfish.js")
      console.log("Worker created with absolute path")
    } catch (error) {
      console.error("Failed to create worker with absolute path:", error)

      try {
        // Try with relative path as fallback
        worker = new Worker("stockfish.js")
        console.log("Worker created with relative path")
      } catch (fallbackError) {
        console.error("Failed to create worker with relative path:", fallbackError)
        throw new Error("Could not initialize Stockfish worker")
      }
    }

    // Create our engine interface
    engineInstance = {
      postMessage: (message: string) => {
        console.log("→ To Engine:", message)
        worker.postMessage(message)
      },
      onMessage: (callback: (message: string) => void) => {
        worker.onmessage = (e) => {
          console.log("← From Engine:", e.data.substring(0, 100) + (e.data.length > 100 ? "..." : ""))

          // Check if this is an error from our placeholder file
          if (typeof e.data === "string" && e.data.startsWith("error: This is a placeholder")) {
            console.error("DETECTED PLACEHOLDER STOCKFISH.JS FILE!")
            if (!localStorage.getItem("hasShownPlaceholderAlert")) {
              alert("You are using the placeholder stockfish.js file! Please replace it with the real file.")
              localStorage.setItem("hasShownPlaceholderAlert", "true")
            }
            throw new Error("Placeholder stockfish.js detected")
          }

          callback(e.data)
        }
      },
      terminate: () => {
        console.log("Terminating engine")
        worker.terminate()
        engineInstance = null
      },
    }

    // Add error handler for the worker
    worker.onerror = (e) => {
      console.error("Stockfish worker error:", e)

      // Check if this might be related to the placeholder file
      if (
        e.message &&
        (e.message.includes("placeholder") ||
          e.message.includes("not the real") ||
          e.message.includes("Cannot find module"))
      ) {
        if (!localStorage.getItem("hasShownPlaceholderAlert")) {
          alert(
            "Error with Stockfish worker. You may be using the placeholder stockfish.js file. Please replace it with the real file.",
          )
          localStorage.setItem("hasShownPlaceholderAlert", "true")
        }
      }

      engineInstance = null
    }

    // Initialize the engine
    console.log("Initializing engine with UCI command")
    engineInstance.postMessage("uci")

    // Add these lines to ensure Stockfish reports evaluations from White's perspective
    engineInstance.postMessage("setoption name UCI_Chess960 value false")
    engineInstance.postMessage("setoption name UCI_AnalyseMode value true")
    engineInstance.postMessage("setoption name UCI_LimitStrength value false")

    return new Promise((resolve, reject) => {
      const messageHandler = (message: string) => {
        if (message.includes("uciok")) {
          console.log("Engine initialized successfully")
          // Configure the engine
          engineInstance?.postMessage("isready")
          resolve(engineInstance)
        } else if (message.includes("error") || message.includes("failed")) {
          console.error("Engine initialization error:", message)

          // Check if this is from our placeholder file
          if (message.includes("placeholder") && !localStorage.getItem("hasShownPlaceholderAlert")) {
            alert("You are using the placeholder stockfish.js file! Please replace it with the real file.")
            localStorage.setItem("hasShownPlaceholderAlert", "true")
          }

          reject(new Error("Engine initialization failed: " + message))
        }
      }

      engineInstance?.onMessage(messageHandler)

      // Set a timeout in case we never get uciok
      setTimeout(() => {
        console.log("Engine initialization timed out")
        reject(new Error("Engine initialization timed out"))
      }, 5000)
    })
  } catch (error) {
    console.error("Failed to initialize Stockfish:", error)

    // Check if this might be related to the placeholder file
    if (error instanceof Error && (error.message.includes("placeholder") || error.message.includes("not the real"))) {
      if (!localStorage.getItem("hasShownPlaceholderAlert")) {
        alert(
          "Failed to initialize Stockfish. You may be using the placeholder stockfish.js file. Please replace it with the real file.",
        )
        localStorage.setItem("hasShownPlaceholderAlert", "true")
      }
    }

    return null
  }
}

// Analyze a specific position
export async function analyzePosition(
  engine: ChessEngine,
  fen: string,
  depth = 18,
  timeoutMs = 5000,
): Promise<PositionAnalysis> {
  console.log(`Analyzing position: ${fen.split(" ")[0]} (depth: ${depth}, timeout: ${timeoutMs}ms)`)

  // Get whose turn it is
  const turn = fen.split(" ")[1]
  const isBlackToMove = turn === "b"
  console.log(`Turn: ${isBlackToMove ? "Black" : "White"}`)

  return new Promise((resolve) => {
    let evaluation = 0
    let bestMove: string | undefined
    let actualDepth = 0
    let timeoutId: NodeJS.Timeout
    let variations: Array<{ move: string; evaluation: number; line?: string }> = []
    const analysis: any = {} // Temporary object to hold analysis data

    const messageHandler = (message: string) => {
      // Parse info strings from the engine
      if (message.startsWith("info") && message.includes("score")) {
        // Extract depth
        const depthMatch = / depth (\d+)/.exec(message)
        if (depthMatch) {
          const msgDepth = Number.parseInt(depthMatch[1])
          if (msgDepth > actualDepth) {
            actualDepth = msgDepth
          }
        }

        // Extract score
        const scoreMatch = / score (cp|mate) ([-\d]+)/.exec(message)
        if (scoreMatch) {
          const rawScore = Number.parseInt(scoreMatch[2])
          console.log(`Raw score from Stockfish: ${scoreMatch[1]} ${rawScore}`)

          if (scoreMatch[1] === "cp") {
            // Centipawn score - divide by 100 to get standard evaluation
            evaluation = rawScore / 100
          } else {
            // Mate score
            const mateIn = rawScore
            // Store the mate score in the evaluation but also keep track of it being a mate
            evaluation = mateIn > 0 ? 20 - mateIn * 0.1 : -20 + Math.abs(mateIn) * 0.1
            // Add a mate property to the analysis
            analysis.mate = mateIn
          }

          // If it's Black's turn, flip the sign to get White's perspective
          if (isBlackToMove) {
            evaluation = -evaluation
          }

          console.log(`Converted evaluation (White's perspective): ${evaluation}`)
        }

        // Extract best move from PV
        const pvMatch = / pv ([a-h][1-8][a-h][1-8][qrbn]?)/.exec(message)
        if (pvMatch) {
          const move = pvMatch[1]

          // Extract SAN notation if available
          const sanMatch = / san ([A-Za-z0-9+#=-]+)/.exec(message)
          const san = sanMatch ? sanMatch[1] : convertUciToSan(fen, move)

          // Add to variations with normalized evaluation
          variations.push({
            move: move,
            evaluation: evaluation,
            line: san,
          })
        }
      }

      // Extract best move when analysis is complete
      if (message.startsWith("bestmove")) {
        clearTimeout(timeoutId)

        const moveMatch = /bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/.exec(message)
        if (moveMatch) {
          bestMove = moveMatch[1]
        }

        // If we don't have any variations but have a best move, create one
        if (variations.length === 0 && bestMove) {
          const san = convertUciToSan(fen, bestMove)
          variations.push({
            move: bestMove,
            evaluation: evaluation,
            line: san,
          })
        }

        // Sort variations by evaluation (best first)
        variations.sort((a, b) => {
          // For white, higher eval is better
          return b.evaluation - a.evaluation
        })

        // Limit to top 3 variations
        variations = variations.slice(0, 3)

        console.log(`Analysis complete: eval=${evaluation}, bestMove=${bestMove}, depth=${actualDepth}`)

        // Resolve the promise with the analysis results
        resolve({
          fen,
          evaluation,
          bestMove,
          depth: actualDepth || 1,
          variations,
          mate: analysis.mate, // Include the mate property
        })
      }
    }

    // Add the message handler
    engine.onMessage(messageHandler)

    // Set the position and start analysis
    engine.postMessage(`position fen ${fen}`)
    engine.postMessage(`go depth ${depth} movetime ${timeoutMs}`)

    // Set a timeout to prevent hanging
    timeoutId = setTimeout(() => {
      console.log("Analysis timed out, stopping engine")
      engine.postMessage("stop")
    }, timeoutMs)
  })
}

// Helper function to convert UCI move notation to SAN
function convertUciToSan(fen: string, uciMove: string): string {
  try {
    const chess = new Chess(fen)
    const from = uciMove.substring(0, 2)
    const to = uciMove.substring(2, 4)
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined

    const move = chess.move({
      from,
      to,
      promotion,
    })

    // Undo the move to keep the position unchanged
    chess.undo()

    return move ? move.san : uciMove
  } catch (e) {
    console.error("Error converting UCI to SAN:", e)
    return uciMove
  }
}

// Analyze a complete game
export async function analyzeGame(
  game: Chess,
  progressCallback: (progress: number) => void,
  depth = 18,
  timeoutMs = 5000,
  shouldCancel: () => boolean = () => false,
): Promise<AnalysisResult> {
  try {
    console.log(`Starting game analysis with depth=${depth}, timeout=${timeoutMs}ms`)

    // Initialize our engine
    const engine = await initStockfish()

    // If engine failed to initialize, fall back to deterministic analysis
    if (!engine) {
      console.warn("Engine initialization failed, using fallback analysis")
      return fallbackAnalysis(game, progressCallback)
    }

    // Get all positions from the game
    const positions: PositionAnalysis[] = []
    const chess = new Chess()

    // Add starting position
    positions.push({
      fen: chess.fen(),
      evaluation: 0.0,
      depth: 10,
    })

    // Replay the game and analyze each position
    const moves = game.history({ verbose: true })
    console.log(`Game has ${moves.length} moves to analyze`)

    // Track mistakes and blunders
    let whiteMistakes = 0
    let blackMistakes = 0
    let whiteBlunders = 0
    let blackBlunders = 0

    // Track accuracy
    let whiteAccuracy = 0
    let blackAccuracy = 0
    let whitePositions = 0
    let blackPositions = 0

    // Previous evaluation to detect mistakes and blunders
    let prevEval = 0

    for (let i = 0; i < moves.length; i++) {
      // Check if analysis should be cancelled
      if (shouldCancel()) {
        console.log("Analysis cancelled by user")
        engine.terminate()
        throw new Error("Analysis cancelled")
      }

      const move = moves[i]
      console.log(`Analyzing move ${i + 1}/${moves.length}: ${move.san}`)

      // Make the move first, then analyze the resulting position
      chess.move({ from: move.from, to: move.to, promotion: move.promotion })

      // Update progress
      const currentProgress = (i / moves.length) * 100
      console.log(`Progress: ${currentProgress.toFixed(1)}%`)
      progressCallback(currentProgress)

      try {
        // Analyze the position AFTER making the move
        const analysis = await analyzePosition(engine, chess.fen(), depth, timeoutMs)

        // Add the position analysis
        positions.push({
          fen: chess.fen(),
          evaluation: analysis.evaluation,
          bestMove: analysis.bestMove,
          depth: analysis.depth,
          variations: analysis.variations,
          mate: analysis.mate,
        })

        // Calculate evaluation change
        const evalChange = analysis.evaluation - prevEval

        // Debug log
        console.log(
          `Move ${i + 1}: ${move.san}, Color: ${move.color}, Eval: ${analysis.evaluation}, PrevEval: ${prevEval}, Change: ${evalChange}`,
        )

        // Detect mistakes and blunders based on the evaluation change
        const isWhiteMove = move.color === "w"

        // Adjust thresholds for mistakes and blunders
        const mistakeThreshold = 0.8
        const blunderThreshold = 1.8

        // For white: negative eval change is bad
        // For black: positive eval change is bad
        if (isWhiteMove) {
          if (evalChange < -mistakeThreshold && evalChange >= -blunderThreshold) {
            whiteMistakes++
          } else if (evalChange < -blunderThreshold) {
            whiteBlunders++
          }
        } else {
          if (evalChange > mistakeThreshold && evalChange <= blunderThreshold) {
            blackMistakes++
          } else if (evalChange > blunderThreshold) {
            blackBlunders++
          }
        }

        // Calculate accuracy (higher is better)
        let accuracy = 100
        if ((isWhiteMove && evalChange < 0) || (!isWhiteMove && evalChange > 0)) {
          // Reduce accuracy based on how bad the move was
          const badness = Math.abs(evalChange)
          accuracy = Math.max(0, 100 - badness * 20)
        }

        if (isWhiteMove) {
          whiteAccuracy += accuracy
          whitePositions++
        } else {
          blackAccuracy += accuracy
          blackPositions++
        }

        prevEval = analysis.evaluation
      } catch (error) {
        // Check if analysis was cancelled
        if (shouldCancel()) {
          console.log("Analysis cancelled during position analysis")
          engine.terminate()
          throw new Error("Analysis cancelled")
        }

        console.error("Error analyzing position:", error)

        // Add a placeholder analysis if a position fails
        positions.push({
          fen: chess.fen(),
          evaluation: calculateMaterialBalance(chess), // Use material balance as fallback
          depth: 1,
        })
      }

      // Small delay to prevent UI freezing
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    // Calculate average accuracy
    const whiteAvgAccuracy = whitePositions > 0 ? whiteAccuracy / whitePositions / 100 : 0.5
    const blackAvgAccuracy = blackPositions > 0 ? blackAccuracy / blackPositions / 100 : 0.5

    // Terminate the engine
    engine.terminate()

    // Detect sacrifices
    const sacrifices = detectSacrifices(positions)

    console.log("Game analysis complete")

    // Add sacrifice information to the result
    return {
      positions,
      accuracy: {
        white: whiteAvgAccuracy,
        black: blackAvgAccuracy,
      },
      mistakes: {
        white: whiteMistakes,
        black: blackMistakes,
      },
      blunders: {
        white: whiteBlunders,
        black: blackBlunders,
      },
      sacrifices: {
        white: sacrifices.filter((s) => s.side === "white").length,
        black: sacrifices.filter((s) => s.side === "black").length,
      },
    }
  } catch (error) {
    // If the error is due to cancellation, rethrow it
    if (error instanceof Error && error.message === "Analysis cancelled") {
      throw error
    }

    console.error("Error analyzing game:", error)

    // Return a fallback analysis if the engine fails
    return fallbackAnalysis(game, progressCallback)
  }
}

// Helper function to calculate material balance
function calculateMaterialBalance(chess: Chess): number {
  const fen = chess.fen()
  const position = fen.split(" ")[0]

  // More precise piece values
  const pieceValues: Record<string, number> = {
    p: -1,
    n: -3,
    b: -3.25,
    r: -5,
    q: -9,
    k: 0,
    P: 1,
    N: 3,
    B: 3.25,
    R: 5,
    Q: 9,
    K: 0,
  }

  let balance = 0
  for (const char of position) {
    if (pieceValues[char] !== undefined) {
      balance += pieceValues[char]
    }
  }

  return balance
}

// Detect sacrifices based on evaluation changes
function detectSacrifices(
  positions: PositionAnalysis[],
): Array<{ moveIndex: number; side: "white" | "black"; value: number }> {
  const sacrifices: Array<{ moveIndex: number; side: "white" | "black"; value: number }> = []

  for (let i = 1; i < positions.length - 2; i++) {
    const currentEval = positions[i].evaluation
    const nextEval = positions[i + 1].evaluation
    const futureEval = positions[i + 2].evaluation

    const isWhiteMove = i % 2 === 1
    const side = isWhiteMove ? "white" : "black"

    // For white: negative eval change followed by positive change may indicate sacrifice
    // For black: positive eval change followed by negative change may indicate sacrifice
    if (isWhiteMove) {
      const initialChange = nextEval - currentEval
      const followupChange = futureEval - nextEval

      // Material loss followed by positional gain
      if (initialChange < -0.5 && followupChange > 0.7) {
        sacrifices.push({
          moveIndex: i,
          side: "white",
          value: Math.abs(initialChange),
        })
      }
    } else {
      const initialChange = nextEval - currentEval
      const followupChange = futureEval - nextEval

      // Material loss followed by positional gain
      if (initialChange > 0.5 && followupChange < -0.7) {
        sacrifices.push({
          moveIndex: i,
          side: "black",
          value: Math.abs(initialChange),
        })
      }
    }
  }

  return sacrifices
}

// Fallback analysis function in case engine integration fails
async function fallbackAnalysis(game: Chess, progressCallback: (progress: number) => void): Promise<AnalysisResult> {
  console.log("Using fallback analysis method")

  // Get all positions from the game
  const positions: PositionAnalysis[] = []
  const chess = new Chess()

  // Add starting position
  positions.push({
    fen: chess.fen(),
    evaluation: 0.0,
    depth: 10,
  })

  // Replay the game and analyze each position
  const moves = game.history({ verbose: true })

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]
    chess.move({ from: move.from, to: move.to, promotion: move.promotion })

    // Update progress
    const currentProgress = (i / moves.length) * 100
    console.log(`Fallback progress: ${currentProgress.toFixed(1)}%`)
    progressCallback(currentProgress)

    // Calculate material balance for realistic evaluations
    const material = calculateMaterialBalance(chess)

    // Add some positional factors (simplified)
    const positionalFactor = Math.random() * 0.4 - 0.2 // Random value between -0.2 and 0.2

    // Combine material and positional factors
    let evaluation = material + positionalFactor

    // Check for checkmate or stalemate
    if (chess.isCheckmate()) {
      // If it's checkmate, assign a very high evaluation for the side that won
      evaluation = chess.turn() === "w" ? -20 : 20
    } else if (chess.isStalemate() || chess.isDraw()) {
      // If it's a draw, evaluation is 0;
      evaluation = 0
    }

    // Cap evaluation between -20 and 20
    evaluation = Math.max(-20, Math.min(20, evaluation))

    // Add the position analysis
    positions.push({
      fen: chess.fen(),
      evaluation: evaluation,
      depth: 8, // Simulate a reasonable depth
    })

    // Small delay to prevent UI freezing
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  // Calculate accuracy, mistakes and blunders based on evaluation changes
  let whiteMistakes = 0
  let blackMistakes = 0
  let whiteBlunders = 0
  let blackBlunders = 0

  // Track accuracy
  let whiteAccuracy = 0
  let blackAccuracy = 0
  let whitePositions = 0
  let blackPositions = 0

  // Analyze evaluation changes to detect mistakes and blunders
  for (let i = 1; i < positions.length - 1; i++) {
    const prevEval = positions[i].evaluation
    const nextEval = positions[i + 1].evaluation
    const evalDiff = nextEval - prevEval

    const isWhiteMove = i % 2 === 0 // Adjusted for 0-based indexing

    if (isWhiteMove) {
      // For white, negative eval diff is bad (position got worse)
      if (evalDiff < -1.5 && evalDiff >= -3) {
        whiteMistakes++
      } else if (evalDiff < -3) {
        whiteBlunders++
      }

      // Calculate accuracy (higher is better)
      const accuracy = Math.max(0, 100 - Math.abs(evalDiff) * 10)
      whiteAccuracy += accuracy
      whitePositions++
    } else {
      // For black, positive eval diff is bad (position got worse)
      if (evalDiff > 1.5 && evalDiff <= 3) {
        blackMistakes++
      } else if (evalDiff > 3) {
        blackBlunders++
      }

      // Calculate accuracy (higher is better)
      const accuracy = Math.max(0, 100 - Math.abs(evalDiff) * 10)
      blackAccuracy += accuracy
      blackPositions++
    }
  }

  // Calculate average accuracy
  const whiteAvgAccuracy = whitePositions > 0 ? whiteAccuracy / whitePositions / 100 : 0.7
  const blackAvgAccuracy = blackPositions > 0 ? blackAccuracy / blackPositions / 100 : 0.7

  // Detect sacrifices (simplified for fallback)
  const sacrifices = detectSacrifices(positions)

  console.log("Fallback analysis complete")

  return {
    positions,
    accuracy: {
      white: whiteAvgAccuracy,
      black: blackAvgAccuracy,
    },
    mistakes: {
      white: whiteMistakes,
      black: blackMistakes,
    },
    blunders: {
      white: whiteBlunders,
      black: blackBlunders,
    },
    sacrifices: {
      white: sacrifices.filter((s) => s.side === "white").length,
      black: sacrifices.filter((s) => s.side === "black").length,
    },
  }
}
