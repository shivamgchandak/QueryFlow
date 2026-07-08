"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { MessageCircleQuestion, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- resolvedTheme is undefined until after hydration; this is next-themes' documented pattern for avoiding a hydration mismatch on the icon.
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-3xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MessageCircleQuestion className="size-5 text-primary" />
          QueryFlow
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!token ? (
            pathname === "/login" ? (
              <Link href="/">
                <Button variant="outline">Go to Home</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button>Admin Login</Button>
              </Link>
            )
          ) : (
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => {
                  localStorage.removeItem("token")
                  window.location.href = "/"
                }}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
