"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Chess } from "chess.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { analyzeGame, initStockfish } from "@/lib/stockfish"
import { calculatePlaystyle } from "@/lib/playstyle-analyzer"
import { findMatchingGrandmaster } from "@/lib/gm-matcher"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Upload, FileText, AlertTriangle, Sparkles, Zap, Crown, Link2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import type { PlaystyleData, AnalysisResult } from "@/lib/types"
import { GrandmasterMatch } from "@/components/grandmaster-match"
import { ChesscomLink } from "@/components/chesscom-link"

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
  const [sideToAnalyze, setSideToAnalyze] = useState<"white" | "black">("white")
  const [displayedSide, setDisplayedSide] = useState<"white" | "black">("white")
  const [usingFallback, setUsingFallback] = useState(false)
  const [engineLoaded, setEngineLoaded] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [placeholderDetected, setPlaceholderDetected] = useState(false)
  const [inputMethod, setInputMethod] = useState<"chesscom" | "text" | "file">("chesscom")
  const [pgnText, setPgnText] = useState("")
  const [cancelAnalysisRef, setCancelAnalysisRef] = useState(useRef(false))
  const [showResult, setShowResult] = useState(false)
  const [isLoadingChesscom, setIsLoadingChesscom] = useState(false)

  // Try to initialize engine when the component mounts
  useEffect(() => {
    async function loadEngine() {
      try {
        setStatusMessage("Initializing chess engine...")
        setEngineLoaded(false)
        setUsingFallback(false)
        setPlaceholderDetected(false)

        try {
          const jsResponse = await fetch("/stockfish.js", { method: "HEAD" })
          const wasmResponse = await fetch("/stockfish.wasm", { method: "HEAD" })

          if (!jsResponse.ok || !wasmResponse.ok) {
            throw new Error("Stockfish files not found")
          }
        } catch (err) {
          setEngineLoaded(false)
          setUsingFallback(true)
          setStatusMessage(null)
          return
        }

        const engine = await initStockfish()

        if (engine) {
          setEngineLoaded(true)
          setUsingFallback(false)
          setStatusMessage(null)
        } else {
          setEngineLoaded(false)
          setUsingFallback(true)
          setStatusMessage(null)
        }
      } catch (err) {
        setEngineLoaded(false)
        setUsingFallback(true)
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
    if (error) setError(null)
  }

  const loadPgn = (pgnContent: string) => {
    try {
      setPgn(pgnContent)
      const chessGame = new Chess()
      chessGame.loadPgn(pgnContent)
      setGame(chessGame)
      setError(null)
      setStatusMessage(null)
      return chessGame
    } catch (err) {
      setError("Invalid PGN format. Please check your input and try again.")
      setPgn(null)
      setGame(null)
      setStatusMessage(null)
      return null
    }
  }

  const handleChesscomGame = (pgnContent: string) => {
    setIsLoadingChesscom(false)
    loadPgn(pgnContent)
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
    setShowResult(false)
  }

  const cancelAnalysis = () => {
    cancelAnalysisRef.current = true
  }

  const startAnalysis = async () => {
    resetAnalysisState()

    let gameToAnalyze = game

    if (inputMethod === "text") {
      if (!pgnText.trim()) {
        setError("Please enter PGN text.")
        return
      }

      setStatusMessage("Loading PGN text...")
      gameToAnalyze = loadPgn(pgnText)

      if (!gameToAnalyze) {
        return
      }
    } else if (!game) {
      setError("Please upload a PGN file first.")
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setError(null)
    setUsingFallback(!engineLoaded)
    cancelAnalysisRef.current = false
    setStatusMessage(null)

    try {
      const analysisDepth = 12
      const analysisTimeout = 3000

      const result = await analyzeGame(
        gameToAnalyze,
        (p) => {
          setProgress(p)
        },
        analysisDepth,
        analysisTimeout,
        () => cancelAnalysisRef.current,
      )

      if (cancelAnalysisRef.current) {
        setError("Analysis was cancelled.")
        return
      }

      setAnalysisResult(result)
      const playstyleData = calculatePlaystyle(gameToAnalyze, result, sideToAnalyze)
      setPlaystyle(playstyleData)
      const gm = findMatchingGrandmaster(playstyleData)
      setMatchedGM(gm)
      setDisplayedSide(sideToAnalyze)
      setHasAnalyzed(true)
      setShowResult(true)
    } catch (err) {
      if (!cancelAnalysisRef.current) {
        setError("Error during analysis. Please try again.")
      }
      setUsingFallback(true)
    } finally {
      setIsAnalyzing(false)
      setProgress(100)
    }
  }

  return (
    <div className="space-y-4">
      {!showResult ? (
        <Card className="bg-black/50 border-tiktok-red/30 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              {placeholderDetected && (
                <div className="mb-4 bg-red-900/30 p-3 rounded-xl border border-red-500/50 text-white text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="font-bold">Missing Stockfish files!</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-2">
                <p className="text-white text-sm">👇 Drop your chess moves below 👇</p>
              </div>

              <div className="flex space-x-2 bg-black/30 p-1 rounded-full">
              <button
  onClick={() => setInputMethod("chesscom")}
  className={`py-2 px-4 flex-1 flex items-center justify-center gap-2 rounded-full transition-all ${
    inputMethod === "chesscom"
      ? "bg-tiktok-red text-white font-medium"
      : "text-white/70 hover:text-white"
  }`}
>
  <Link2 size={16} />
  <span className="pointer-events-none">Chess.com</span>
</button>
<button
  onClick={() => setInputMethod("text")}
  className={`py-2 px-4 flex-1 flex items-center justify-center gap-2 rounded-full transition-all ${
    inputMethod === "text" ? "bg-tiktok-red text-white font-medium" : "text-white/70 hover:text-white"
  }`}
>
  <FileText size={16} />
  <span className="pointer-events-none">Paste PGN</span>
</button>
<button
  onClick={() => setInputMethod("file")}
  className={`py-2 px-4 flex-1 flex items-center justify-center gap-2 rounded-full transition-all ${
    inputMethod === "file" ? "bg-tiktok-red text-white font-medium" : "text-white/70 hover:text-white"
  }`}
>
  <Upload size={16} />
  <span className="pointer-events-none">Upload PGN</span>
</button>

              </div>

              <div>
                {inputMethod === "file" ? (
                  <div className="relative">
                    <label
                      htmlFor="pgn-upload"
                      className="block w-full text-sm text-white/70 cursor-pointer
                        border-2 border-dashed border-white/20 rounded-xl p-8
                        hover:bg-white/5 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-tiktok-red" />
                        <p className="font-medium text-white">Click to upload your game</p>
                        <p className="text-xs mt-1">or drag and drop your PGN file</p>
                        <p className="text-xs mt-3 text-white/50">
                          Don't have a PGN? Just screenshot your game and we'll pretend we analyzed it 🤫
                        </p>
                      </div>
                      <input
                        id="pgn-upload"
                        type="file"
                        accept=".pgn"
                        onChange={handleFileUpload}
                        disabled={isAnalyzing}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : inputMethod === "text" ? (
                  <div className="relative">
                    <Textarea
                      id="pgn-text"
                      placeholder="Paste your PGN text here... (or just random chess moves, we won't tell 🤭)"
                      value={pgnText}
                      onChange={handlePgnTextChange}
                      disabled={isAnalyzing}
                      className="min-h-[120px] font-mono text-sm border-2 border-white/20 rounded-xl bg-black/30 text-white"
                    />
                  </div>
                ) : (
                  <ChesscomLink
                    onGameSelected={handleChesscomGame}
                    isLoading={isLoadingChesscom}
                    setIsLoading={setIsLoadingChesscom}
                  />
                )}
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                <div className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-tiktok-red" />
                  <span>I play as:</span>
                </div>
                <RadioGroup
                  value={sideToAnalyze}
                  onValueChange={(value) => setSideToAnalyze(value as "white" | "black")}
                  className="flex space-x-4"
                  disabled={isAnalyzing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="white" id="white" disabled={isAnalyzing} className="text-tiktok-red" />
                    <Label
                      htmlFor="white"
                      className={`text-white ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      White ♟️
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="black" id="black" disabled={isAnalyzing} className="text-tiktok-red" />
                    <Label
                      htmlFor="black"
                      className={`text-white ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Black ♟️
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-white/50 mt-2 italic">
                  {sideToAnalyze === "white"
                    ? "White pieces = main character energy ✨"
                    : "Black pieces = villain era 😈"}
                </p>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                  {error}
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-2 bg-black/30 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70 flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                      <span className="pointer-events-none">AI is analyzing your moves...</span>
                    </span>
                    <span className="text-white/70 font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="absolute inset-0 bg-tiktok-red transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50 italic">
                      {progress < 30
                        ? "Analyzing your blunders... 🙈"
                        : progress < 60
                          ? "Finding your chess personality... 🧠"
                          : "Matching with your GM twin... 👯‍♂️"}
                    </p>
                    <Button variant="destructive" size="sm" onClick={cancelAnalysis} className="rounded-full">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={startAnalysis}
                disabled={
                  (inputMethod === "file" && !game) ||
                  isAnalyzing ||
                  (inputMethod === "text" && !pgnText.trim()) ||
                  (inputMethod === "chesscom" && !game) ||
                  isLoadingChesscom
                }
                className="w-full py-6 rounded-full bg-tiktok-red hover:bg-tiktok-red/90 text-white font-bold text-lg"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2 pointer-events-none">
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
                    <span className="pointer-events-none">Analyzing...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 pointer-events-none">
                    <Sparkles className="h-5 w-5" />
                    <span>Find My Chess Twin</span>
                  </span>
                )}
              </Button>

              <div className="text-center text-xs text-white/50 italic">
                <p>No PGN? No problem! Just upload anything - our AI is 87% guesswork anyway 😂</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {playstyle && matchedGM && (
            <div>
              <GrandmasterMatch grandmaster={matchedGM} playstyle={playstyle} side={displayedSide} />
              <Button
                onClick={() => setShowResult(false)}
                className="w-full mt-4 py-4 rounded-full bg-white text-black font-bold"
              >
                <span className="pointer-events-none">Try Another Game</span>
              </Button>
              <p className="text-center text-xs text-white/50 mt-2">
                Not happy with your twin? Keep trying until you get Magnus! 😉
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
