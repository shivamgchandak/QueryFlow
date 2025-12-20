"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const pathname = usePathname()

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null

  return (
    <div className="flex justify-between items-center px-6 py-4 border-b">
      <Link href="/" className="font-bold text-lg">
        Hemut Q&A
      </Link>

      <div>
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
          <div className="flex gap-3">
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
  )
}