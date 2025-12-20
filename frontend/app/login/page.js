"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const login = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })

    if (!res.ok) return alert("Invalid credentials")

    const data = await res.json()
    localStorage.setItem("token", data.access_token)
    window.location.href = "/dashboard"
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-4">Admin Login</h1>
      <Input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <Input
        type="password"
        placeholder="Password"
        className="mt-3"
        onChange={e => setPassword(e.target.value)}
      />
      <Button className="mt-4 w-full" onClick={login}>
        Login
      </Button>
    </div>
  )
}