"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="flex items-center gap-2 transition-all hover:scale-105 shadow-md bg-background/80 backdrop-blur-sm rounded-full border-2 border-tiktok-blue/30 animate-pulse-glow"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5 text-tiktok-yellow" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-tiktok-purple" />
          <span>Dark Mode</span>
        </>
      )}
    </Button>
  )
}
