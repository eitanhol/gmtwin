"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Chess } from "chess.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chessboard } from "@/components/chessboard"
import { GrandmasterMatch } from "@/components/grandmaster-match"
import { PlaystyleMetrics } from "@/components/playstyle-metrics"
import { analyzeGame, initStockfish } from "@/lib/stockfish"
import { calculatePlaystyle } from "@/lib/playstyle-analyzer"
import { findMatchingGrandmaster } from "@/lib/gm-matcher"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  Info,
  Upload,
  FileText,
  AlertTriangle,
  Sparkles,
  Brain,
  CastleIcon as ChessKnight,
  Zap,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import type { PlaystyleData, AnalysisResult } from "@/lib/types"

export function ChessAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pgn, setPgn] = useState<string | null>(null)
  const [game, setGame] = useState<Chess | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [playstyle, setPlaystyle] = useState<PlaystyleData | null>(null)
  const [matchedGM, setMatchedGM] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Track both the side to analyze next and the currently displayed side
  const [sideToAnalyze, setSideToAnalyze] = useState<"white" | "black">("white")
  const [displayedSide, setDisplayedSide] = useState<"white" | "black">("white")

  const [usingFallback, setUsingFallback] = useState(false)
  const [engineLoaded, setEngineLoaded] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [placeholderDetected, setPlaceholderDetected] = useState(false)

  // Input method state
  const [inputMethod, setInputMethod] = useState<"file" | "text">("file")
  const [pgnText, setPgnText] = useState("")

  // Add a new state for deep analysis mode and a ref for cancellation
  const [deepAnalysis, setDeepAnalysis] = useState(false)
  const [cancelAnalysisRef, setCancelAnalysisRef] = useState(useRef(false))
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)

  // Try to initialize engine when the component mounts
  useEffect(() => {
    async function loadEngine() {
      try {
        console.log("Attempting to load Stockfish engine...")
        setStatusMessage("Initializing chess engine...")
        // Set loading state immediately to prevent showing the error alert
        setEngineLoaded(false)
        setUsingFallback(false)
        setPlaceholderDetected(false)

        // Check if both stockfish.js and stockfish.wasm exist
        try {
          const jsResponse = await fetch("/stockfish.js", { method: "HEAD" })
          const wasmResponse = await fetch("/stockfish.wasm", { method: "HEAD" })

          if (!jsResponse.ok || !wasmResponse.ok) {
            throw new Error("Stockfish files not found")
          }
        } catch (err) {
          console.error("Stockfish files check failed:", err)
          setEngineLoaded(false)
          setUsingFallback(true)
          setError(
            "Stockfish engine files (stockfish.js and stockfish.wasm) are missing. Please add them to the public directory.",
          )
          setStatusMessage(null)
          return
        }

        const engine = await initStockfish()

        if (engine) {
          console.log("Stockfish engine loaded successfully!")
          setEngineLoaded(true)
          setUsingFallback(false)
          setStatusMessage(null)
        } else {
          console.warn("Stockfish engine couldn't be loaded, using fallback analysis")
          setEngineLoaded(false)
          setUsingFallback(true)

          // Check if this might be due to the placeholder file
          const placeholderError = document
            .querySelector('script[src*="stockfish.js"]')
            ?.textContent?.includes("PLACEHOLDER")
          if (placeholderError) {
            setPlaceholderDetected(true)
            setError("You are using the PLACEHOLDER stockfish.js file. Please replace it with the real file.")
          } else {
            setError("Analysis engine couldn't be loaded. Using simplified analysis instead.")
          }

          setStatusMessage(null)
        }
      } catch (err) {
        console.error("Failed to load analysis engine:", err)
        setEngineLoaded(false)
        setUsingFallback(true)

        // Check if this might be due to the placeholder file
        if (err instanceof Error && err.message.includes("placeholder")) {
          setPlaceholderDetected(true)
          setError("You are using the PLACEHOLDER stockfish.js file. Please replace it with the real file.")
        } else {
          setError("Analysis engine couldn't be loaded. Using simplified analysis instead.")
        }

        setStatusMessage(null)
      }
    }

    loadEngine()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    resetAnalysisState()

    const file = event.target.files?.[0]
    if (!file) return

    setStatusMessage("Loading PGN file...")

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const pgnText = e.target?.result as string
        loadPgn(pgnText)
      } catch (err) {
        setError("Invalid PGN file. Please upload a valid chess game.")
        setPgn(null)
        setGame(null)
        setStatusMessage(null)
      }
    }
    reader.readAsText(file)
  }

  const handlePgnTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPgnText(e.target.value)
    // Reset any previous errors when the user changes the text
    if (error) setError(null)
  }

  const loadPgn = (pgnContent: string) => {
    try {
      setPgn(pgnContent)

      // Initialize chess.js with the PGN
      const chessGame = new Chess()
      chessGame.loadPgn(pgnContent)
      setGame(chessGame)
      setError(null)
      setStatusMessage(null)

      console.log("PGN loaded successfully:", chessGame.history().length, "moves")
      return chessGame
    } catch (err) {
      console.error("Error loading PGN:", err)
      setError("Invalid PGN format. Please check your input and try again.")
      setPgn(null)
      setGame(null)
      setStatusMessage(null)
      return null
    }
  }

  const resetAnalysisState = () => {
    setError(null)
    setAnalysisResult(null)
    setPlaystyle(null)
    setMatchedGM(null)
    setProgress(0)
    setUsingFallback(false)
    setHasAnalyzed(false)
    setStatusMessage(null)
    setCurrentMoveIndex(0)
  }

  // Add this function to handle cancellation
  const cancelAnalysis = () => {
    cancelAnalysisRef.current = true
  }

  // Update the startAnalysis function to analyze the selected side
  const startAnalysis = async () => {
    // Reset analysis state
    resetAnalysisState()

    let gameToAnalyze = game

    // If using text input method, try to load the PGN first
    if (inputMethod === "text") {
      if (!pgnText.trim()) {
        setError("Please enter PGN text.")
        return
      }

      setStatusMessage("Loading PGN text...")

      // Try to load the PGN text
      gameToAnalyze = loadPgn(pgnText)

      if (!gameToAnalyze) {
        // loadPgn already sets the error message
        return
      }
    } else if (!game) {
      // If using file input but no game is loaded
      setError("Please upload a PGN file first.")
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setError(null)
    setUsingFallback(!engineLoaded)
    cancelAnalysisRef.current = false // Reset cancel flag
    setStatusMessage(null) // Remove any status message during analysis

    try {
      // Analyze the game with depth and timeout based on deep analysis setting
      const analysisDepth = deepAnalysis ? 20 : 12
      const analysisTimeout = deepAnalysis ? 10000 : 3000

      console.log(`Starting analysis with depth=${analysisDepth}, timeout=${analysisTimeout}ms, deep=${deepAnalysis}`)

      // Pass the cancel ref to the analysis function
      const result = await analyzeGame(
        gameToAnalyze,
        (p) => {
          setProgress(p)
        },
        analysisDepth,
        analysisTimeout,
        () => cancelAnalysisRef.current,
      )

      // Check if analysis was cancelled
      if (cancelAnalysisRef.current) {
        setError("Analysis was cancelled.")
        return
      }

      setAnalysisResult(result)

      // Calculate playstyle metrics for the selected side
      const playstyleData = calculatePlaystyle(gameToAnalyze, result, sideToAnalyze)
      setPlaystyle(playstyleData)

      // Find matching grandmaster
      const gm = findMatchingGrandmaster(playstyleData)
      setMatchedGM(gm)

      // Update the displayed side to match the analyzed side
      setDisplayedSide(sideToAnalyze)
      setHasAnalyzed(true)
    } catch (err) {
      console.error("Analysis error:", err)
      if (!cancelAnalysisRef.current) {
        setError("Error during analysis. Please try again.")
      }
      setUsingFallback(true)
    } finally {
      setIsAnalyzing(false)
      setProgress(100)
    }
  }

  const goToMove = (moveIndex: number) => {
    setCurrentMoveIndex(moveIndex)
    if (game) {
      const chess = new Chess()
      chess.loadPgn(pgn || "")

      const moves = chess.history({ verbose: true })
      if (moveIndex > 0 && moveIndex <= moves.length) {
        const chess2 = new Chess()
        chess2.loadPgn(pgn || "")
        for (let i = 0; i < moveIndex; i++) {
          chess2.move(moves[i].san)
        }
        setGame(chess2)
      } else {
        setGame(chess)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="tiktok-card animate-slide-in-bottom">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {placeholderDetected && (
              <Alert variant="destructive" className="mb-4 border-2 border-tiktok-red rounded-xl">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold">PLACEHOLDER STOCKFISH.JS DETECTED!</AlertTitle>
                <AlertDescription className="text-sm">
                  You are using the placeholder stockfish.js file. Please replace it with the real file from
                  <a
                    href="https://github.com/nmrugg/stockfish.js/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline ml-1"
                  >
                    the Stockfish.js releases page
                  </a>
                  .
                  <br />
                  Make sure both stockfish.js and stockfish.wasm are in your public directory.
                </AlertDescription>
              </Alert>
            )}

            {!engineLoaded && usingFallback && !placeholderDetected && (
              <Alert variant="destructive" className="mb-4 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Using Simplified Analysis</AlertTitle>
                <AlertDescription>
                  Advanced analysis engine could not be loaded. Using simplified analysis algorithm instead.
                </AlertDescription>
              </Alert>
            )}

            {/* Input method tabs */}
            <div className="border-b border-border">
              <div className="flex space-x-2">
                <button
                  onClick={() => setInputMethod("file")}
                  className={`py-2 px-4 flex items-center gap-2 rounded-t-lg transition-all ${
                    inputMethod === "file"
                      ? "bg-gradient-to-r from-tiktok-red to-tiktok-blue text-white font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload size={16} />
                  Upload PGN File
                </button>
                <button
                  onClick={() => setInputMethod("text")}
                  className={`py-2 px-4 flex items-center gap-2 rounded-t-lg transition-all ${
                    inputMethod === "text"
                      ? "bg-gradient-to-r from-tiktok-red to-tiktok-blue text-white font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText size={16} />
                  Paste PGN Text
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                {inputMethod === "file" ? (
                  <>
                    <label htmlFor="pgn-upload" className="block text-sm font-medium text-foreground mb-2">
                      Upload PGN File
                    </label>
                    <div className="relative">
                      <input
                        id="pgn-upload"
                        type="file"
                        accept=".pgn"
                        onChange={handleFileUpload}
                        disabled={isAnalyzing}
                        className="block w-full text-sm text-muted-foreground
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-gradient-to-r file:from-tiktok-red file:to-tiktok-blue file:text-white
                         hover:file:opacity-90
                         disabled:opacity-50 disabled:cursor-not-allowed
                         border-2 border-dashed border-border rounded-xl p-4"
                      />
                      <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 opacity-50"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <label htmlFor="pgn-text" className="block text-sm font-medium text-foreground mb-2">
                      Paste PGN Text
                    </label>
                    <div className="relative">
                      <Textarea
                        id="pgn-text"
                        placeholder="Paste your PGN text here..."
                        value={pgnText}
                        onChange={handlePgnTextChange}
                        disabled={isAnalyzing}
                        className="min-h-[120px] font-mono text-sm border-2 border-border rounded-xl"
                      />
                      <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 opacity-50"></div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  onClick={startAnalysis}
                  disabled={
                    (inputMethod === "file" && !game) || isAnalyzing || (inputMethod === "text" && !pgnText.trim())
                  }
                  className="w-full sm:w-auto tiktok-button"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Analyze Game
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Add side selection */}
            <div className="pt-2 space-y-4">
              <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <ChessKnight className="h-4 w-4 text-tiktok-blue" />
                Player to Analyze
              </div>
              <div className="bg-gradient-to-r from-tiktok-red/10 to-tiktok-blue/10 p-4 rounded-xl">
                <RadioGroup
                  value={sideToAnalyze}
                  onValueChange={(value) => setSideToAnalyze(value as "white" | "black")}
                  className="flex space-x-4"
                  disabled={isAnalyzing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="white" id="white" disabled={isAnalyzing} className="text-tiktok-red" />
                    <Label htmlFor="white" className={isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}>
                      White
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="black" id="black" disabled={isAnalyzing} className="text-tiktok-blue" />
                    <Label htmlFor="black" className={isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}>
                      Black
                    </Label>
                  </div>
                </RadioGroup>

                {hasAnalyzed && sideToAnalyze !== displayedSide && (
                  <div className="mt-2 flex items-center text-sm text-tiktok-red">
                    <Info className="h-4 w-4 mr-1" />
                    <span>
                      Click "Analyze Game" to see results for {sideToAnalyze === "white" ? "White" : "Black"} player
                    </span>
                  </div>
                )}

                {/* Add Deep Analysis toggle */}
                <div className="flex items-center space-x-2 pt-4">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="deep-analysis"
                      checked={deepAnalysis}
                      onChange={(e) => setDeepAnalysis(e.target.checked)}
                      disabled={isAnalyzing}
                      className="rounded border-gray-300 text-tiktok-purple focus:ring-tiktok-purple"
                    />
                    {deepAnalysis && (
                      <div className="absolute inset-0 animate-pulse-glow rounded-sm pointer-events-none"></div>
                    )}
                  </div>
                  <Label
                    htmlFor="deep-analysis"
                    className={`flex items-center gap-1 ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Brain className="h-4 w-4 text-tiktok-purple" />
                    Deep Analysis
                    {deepAnalysis && (
                      <span className="text-xs bg-gradient-to-r from-tiktok-purple to-tiktok-pink text-white px-1.5 py-0.5 rounded-full ml-1">
                        PRO
                      </span>
                    )}
                  </Label>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-tiktok-red text-sm mt-2 bg-tiktok-red/10 p-3 rounded-lg border border-tiktok-red/30">
                {error}
              </div>
            )}

            {statusMessage && !isAnalyzing && (
              <div className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-tiktok-blue" />
                {statusMessage}
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-2 bg-gradient-to-r from-tiktok-red/5 to-tiktok-blue/5 p-4 rounded-xl border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Zap className="h-4 w-4 text-tiktok-yellow" />
                    {deepAnalysis ? "Deep Mode" : "Standard Mode"}
                  </span>
                  <span className="text-muted-foreground font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-tiktok-red to-tiktok-blue transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {deepAnalysis
                      ? "Deep analysis may take several minutes. You can cancel if it's taking too long."
                      : "This may take a few minutes for analysis."}
                  </p>
                  <Button variant="destructive" size="sm" onClick={cancelAnalysis} className="ml-2 rounded-full">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {pgn && !isAnalyzing && inputMethod === "file" && (
              <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2 bg-tiktok-blue/10 p-3 rounded-lg">
                <Info className="h-4 w-4 text-tiktok-blue" />
                Game loaded successfully. Click "Analyze Game" to start analysis.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {playstyle && analysisResult && matchedGM && (
        <div className="animate-slide-in-bottom" style={{ animationDelay: "0.3s" }}>
          <Tabs defaultValue="result" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 p-1 bg-gradient-to-r from-tiktok-red/20 to-tiktok-blue/20 rounded-full">
              <TabsTrigger
                value="result"
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-tiktok-red data-[state=active]:to-tiktok-purple data-[state=active]:text-white"
              >
                GM Match
              </TabsTrigger>
              <TabsTrigger
                value="metrics"
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-tiktok-purple data-[state=active]:to-tiktok-blue data-[state=active]:text-white"
              >
                Your Skills
              </TabsTrigger>
              <TabsTrigger
                value="board"
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-tiktok-blue data-[state=active]:to-tiktok-red data-[state=active]:text-white"
              >
                Game Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="result" className="mt-0">
              <GrandmasterMatch grandmaster={matchedGM} playstyle={playstyle} side={displayedSide} />
            </TabsContent>

            <TabsContent value="metrics" className="mt-0">
              <PlaystyleMetrics playstyle={playstyle} side={displayedSide} />
            </TabsContent>

            <TabsContent value="board" className="mt-0">
              <Card className="tiktok-card">
                <CardContent className="pt-6">
                  <Chessboard game={game} analysis={analysisResult} highlightSide={displayedSide} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
