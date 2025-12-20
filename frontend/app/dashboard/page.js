"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function Dashboard() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [token, setToken] = useState(null)

  // 🔐 Auth guard
  useEffect(() => {
    const t = localStorage.getItem("token")
    if (!t) {
      window.location.href = "/login"
    } else {
      setToken(t)
    }
  }, [])

  // 📡 Fetch questions + answers + WebSocket
  useEffect(() => {
    if (!token) return

    const load = async () => {
      const qRes = await fetch("process.env.NEXT_PUBLIC_API_URL/questions")
      const qData = await qRes.json()
      setQuestions(qData)

      const allAnswers = {}
      await Promise.all(
        qData.map(async q => {
          const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/answers/${q.id}`)
          allAnswers[q.id] = await res.json()
        })
      )
      setAnswers(allAnswers)
    }

    load()

    const ws = new WebSocket("process.env.NEXT_PUBLIC_API_URL/ws/questions")
    ws.onmessage = e => setQuestions(JSON.parse(e.data))

    return () => ws.close()
  }, [token])

  // 🔁 Update Status
  const updateStatus = async (id, status) => {
    const res = await fetch(
      `process.env.NEXT_PUBLIC_API_URL/questions/${id}/status?status=${status}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.detail)
      return
    }

    toast.success(`Marked as ${status}`)
  }

  if (!token) return null

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {questions.map(q => {
        const qAnswers = answers[q.id] || []
        const hasAnswers = qAnswers.length > 0
        const isAnswered = q.status === "Answered"
        const isEscalated = q.status === "Escalated"

        return (
          <Card key={q.id} className="p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{q.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(q.created_at).toLocaleString()}
                </p>
              </div>

              <Badge
                variant={
                  q.status === "Answered"
                    ? "success"
                    : q.status === "Escalated"
                    ? "destructive"
                    : "secondary"
                }
              >
                {q.status}
              </Badge>
            </div>

            <div className="flex gap-2 mt-4">
              {/* Escalate / De-escalate */}
              <Button
                size="sm"
                variant="outline"
                disabled={isAnswered}
                onClick={() =>
                  updateStatus(
                    q.id,
                    isEscalated ? "Pending" : "Escalated"
                  )
                }
              >
                {isEscalated ? "De-escalate" : "Escalate"}
              </Button>

              {/* Mark Answered */}
              <Button
                size="sm"
                disabled={isAnswered || !hasAnswers}
                onClick={() => updateStatus(q.id, "Answered")}
              >
                Mark Answered
              </Button>
            </div>

            {!hasAnswers && (
              <p className="text-xs text-gray-400 mt-2">
                Cannot mark answered until at least one answer exists
              </p>
            )}
          </Card>
        )
      })}
    </div>
  )
}