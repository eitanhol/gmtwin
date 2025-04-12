export interface PositionAnalysis {
  fen: string
  evaluation: number
  bestMove?: string
  depth: number
  mate?: number // Add this line to store mate information
  variations?: Array<{
    move: string
    evaluation: number
    line?: string
  }>
}

export interface AnalysisResult {
  positions: PositionAnalysis[]
  accuracy: {
    white: number
    black: number
  }
  mistakes: {
    white: number
    black: number
  }
  blunders: {
    white: number
    black: number
  }
  sacrifices?: {
    white: number
    black: number
  }
}

export interface PlaystyleData {
  aggression: number // 0-1, how aggressively the player attacks
  positional: number // 0-1, how positionally sound the player is
  tactical: number // 0-1, how tactically aware the player is
  defensive: number // 0-1, how well the player defends
  riskTaking: number // 0-1, how willing to take risks the player is
  endgame: number // 0-1, how well the player handles endgames
  openingRepertoire: string[] // The openings the player uses
}

export interface Grandmaster {
  id: string
  name: string
  years: string
  description: string
  playstyle: PlaystyleData
  achievements: string[]
  famousGame: string
  imagePath: string // Add this line
}
