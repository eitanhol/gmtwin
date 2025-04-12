import { ChessAnalyzer } from "@/components/chess-analyzer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black to-gray-900 relative overflow-hidden">
      {/* Simplified background with just one animated element */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-tiktok-red/10 blur-[100px] animate-pulse-slow"></div>
      </div>

      <div className="max-w-md mx-auto relative z-10 px-4">
        <div className="text-center pt-10 pb-6">
          <h1 className="text-6xl font-black mb-2 text-white">
            <span className="text-tiktok-red">CHESS</span>
            <span className="text-white">TWIN</span>
          </h1>
          <p className="text-xl text-white/80 font-medium">✨ Which GM is your secret twin? ✨</p>
          <p className="text-sm text-white/60 mt-2">Upload your game and prepare to be SHOOK 😱</p>
        </div>

        <div>
          <ChessAnalyzer />
        </div>

        <div className="text-center text-white/60 text-xs mt-6 mb-10">
          <p>No chess skills? No problem! 🤣 We'll find your GM twin anyway!</p>
          <p className="mt-1">⬆️ 100K+ players already found their chess twin! ⬆️</p>
        </div>
      </div>
    </main>
  )
}
