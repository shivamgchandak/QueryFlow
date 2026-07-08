"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { ShieldCheck } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const login = async () => {
    if (!email || !password) {
      toast.error("Email and password are required")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.detail || "Invalid credentials")
        return
      }

      const data = await res.json()

      localStorage.setItem("token", data.access_token)

      toast.success("Login successful")
      window.location.href = "/dashboard"

    } catch (error) {
      toast.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = e => {
    if (e.key === "Enter") login()
  }

  return (
    <div className="max-w-sm mx-auto mt-20 px-6">
      <Card className="p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to moderate questions.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <Button
            className="w-full mt-1"
            onClick={login}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
