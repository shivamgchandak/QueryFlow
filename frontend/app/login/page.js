"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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

      // 🔑 Save JWT
      localStorage.setItem("token", data.access_token)

      toast.success("Login successful")
      window.location.href = "/dashboard"

    } catch (error) {
      toast.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-4">Admin Login</h1>

      <Input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        className="mt-3"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <Button
        className="mt-4 w-full"
        onClick={login}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </div>
  )
}