import { ChessAnalyzer } from "@/components/chess-analyzer"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background relative overflow-hidden">
      {/* Animated background elements - reduced for better performance */}
      <div className="fixed inset-0 z-0 opacity-20 animated-bg">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-tiktok-red blur-3xl animate-float"></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-tiktok-blue blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Chess piece decorations - reduced for better performance */}
      <div className="fixed top-10 left-10 opacity-20 animate-spin-slow">
        <svg width="80" height="80" viewBox="0 0 45 45" className="chess-piece chess-piece-shadow">
          <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path
              d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
              fill="#000"
              strokeLinecap="butt"
              strokeLinejoin="miter"
            />
            <path
              d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
              fill="#000"
            />
            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff" />
          </g>
        </svg>
      </div>

      <div className="fixed bottom-10 right-10 opacity-20 animate-bounce-subtle">
        <svg width="80" height="80" viewBox="0 0 45 45" className="chess-piece chess-piece-shadow">
          <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
          </g>
        </svg>
      </div>

      {/* Removed the other decorative chess pieces to improve performance */}

      <div className="fixed top-4 left-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8 pt-16 animate-slide-in-bottom">
          <h1 className="text-5xl font-extrabold mb-4 tiktok-text-gradient pb-1">Chess Style Analyzer</h1>
          <div className="flex justify-center">
            <div className="max-w-2xl relative">
              <p className="text-xl text-foreground/80 font-medium">
                Upload your PGN file to discover which famous Grandmaster you play like
              </p>
            </div>
          </div>
        </div>

        <div className="animate-slide-in-bottom" style={{ animationDelay: "0.2s" }}>
          <ChessAnalyzer />
        </div>

        <div className="pb-8"></div>
      </div>
    </main>
  )
}
