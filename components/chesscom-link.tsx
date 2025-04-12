"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

interface ChesscomLinkProps {
  onGameSelected: (pgn: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ChesscomLink({ onGameSelected, isLoading, setIsLoading }: ChesscomLinkProps) {
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [games, setGames] = useState<any[]>([])
  const [showGames, setShowGames] = useState(false)

  const fetchUserGames = async () => {
    if (!username.trim()) {
      setError("Please enter a Chess.com username")
      return
    }

    setError(null)
    setIsLoading(true)
    setShowGames(false)

    try {
      // First, check if the user exists
      const userResponse = await fetch(`https://api.chess.com/pub/player/${username}`)

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          setError("User not found on Chess.com")
        } else {
          setError("Error connecting to Chess.com")
        }
        setIsLoading(false)
        return
      }

      // Get the user's games from the current month
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // JavaScript months are 0-indexed

      const gamesResponse = await fetch(`https://api.chess.com/pub/player/${username}/games/${year}/${month}`)

      if (!gamesResponse.ok) {
        setError("Couldn't fetch games from Chess.com")
        setIsLoading(false)
        return
      }

      const gamesData = await gamesResponse.json()

      if (!gamesData.games || gamesData.games.length === 0) {
        setError("No games found for this month. Try a different username or upload a PGN file.")
        setIsLoading(false)
        return
      }

      // Process the games to show only the most recent ones
      const recentGames = gamesData.games
        .slice(0, 5) // Get only the 5 most recent games
        .map((game: any) => ({
          url: game.url,
          white: game.white.username,
          black: game.black.username,
          result: game.white.result === "win" ? "1-0" : game.black.result === "win" ? "0-1" : "½-½",
          timestamp: new Date(game.end_time * 1000),
          pgn: game.pgn,
        }))

      setGames(recentGames)
      setShowGames(true)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching Chess.com data:", err)
      setError("Error connecting to Chess.com. Please try again later.")
      setIsLoading(false)
    }
  }

  const selectGame = (pgn: string) => {
    onGameSelected(pgn)
    setShowGames(false)
  }

  return (
    <div className="space-y-4 bg-black/30 p-4 rounded-xl border border-white/20">
      <div className="flex items-center gap-2">
        <img
          src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpmeXx6V.png"
          alt="Chess.com"
          className="w-6 h-6 rounded-full"
        />
        <h3 className="text-white font-medium">Link your Chess.com account</h3>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter Chess.com username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-black/20 border-white/10 text-white"
          disabled={isLoading}
        />
        <Button
          onClick={fetchUserGames}
          disabled={isLoading || !username.trim()}
          className="bg-[#7FA650] hover:bg-[#6d8f45] text-white"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find Games"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/30 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showGames && games.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-white text-sm font-medium">Your recent games:</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {games.map((game, index) => (
              <div
                key={index}
                className="bg-black/40 p-3 rounded-lg border border-white/10 hover:border-white/30 cursor-pointer transition-all"
                onClick={() => selectGame(game.pgn)}
              >
                <div className="flex justify-between items-center">
                  <div className="text-white text-sm">
                    <span className={username.toLowerCase() === game.white.toLowerCase() ? "text-yellow-400" : ""}>
                      {game.white}
                    </span>{" "}
                    vs{" "}
                    <span className={username.toLowerCase() === game.black.toLowerCase() ? "text-yellow-400" : ""}>
                      {game.black}
                    </span>
                  </div>
                  <div className="text-white/70 text-xs">{game.result}</div>
                </div>
                <div className="text-white/50 text-xs mt-1">
                  {game.timestamp.toLocaleDateString()}{" "}
                  {game.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-white/50 italic">We'll fetch your 5 most recent games from Chess.com</div>
    </div>
  )
}
