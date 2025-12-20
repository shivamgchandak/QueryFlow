"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function Forum() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [open, setOpen] = useState({})
  const [message, setMessage] = useState("")
  const [answerText, setAnswerText] = useState({})

  // ---------------------------------
  // Fetch questions + preload answers
  // ---------------------------------
  useEffect(() => {
    const loadData = async () => {
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

    loadData()

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/questions")
    ws.onmessage = e => setQuestions(JSON.parse(e.data))
    return () => ws.close()
  }, [])

  // -----------------------------
  // Submit Question
  // -----------------------------
  const submitQuestion = async () => {
    if (!message.trim()) {
      toast.error("Question cannot be empty")
      return
    }

    await fetch("process.env.NEXT_PUBLIC_API_URL/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    })

    setMessage("")
    toast.success("Question submitted")
  }

  // -----------------------------
  // Submit Answer
  // -----------------------------
  const submitAnswer = async (id) => {
    if (!answerText[id]?.trim()) {
      toast.error("Answer cannot be empty")
      return
    }

    await fetch(`process.env.NEXT_PUBLIC_API_URL/answers/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: answerText[id] })
    })

    setAnswerText(prev => ({ ...prev, [id]: "" }))

    const res = await fetch(`process.env.NEXT_PUBLIC_API_URL/answers/${id}`)
    const data = await res.json()
    setAnswers(prev => ({ ...prev, [id]: data }))

    toast.success("Answer submitted")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Ask Question */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Ask a question..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <Button
          onClick={submitQuestion}
          disabled={!message.trim()}
        >
          Submit
        </Button>
      </div>

      {/* Questions */}
      {questions.map(q => {
        const qAnswers = answers[q.id] || []
        const hasAnswers = qAnswers.length > 0
        const isAnswered = q.status === "Answered"
        const canSendAnswer = !isAnswered && answerText[q.id]?.trim()

        return (
          <Card key={q.id} className="p-4 mb-4">
            <div className="flex justify-between items-center">
              <p>{q.message}</p>
              <Badge>{q.status}</Badge>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(q.created_at).toLocaleString()}
            </p>

            {/* Answer input */}
            <div className="flex gap-2 mt-3">
              <Input
                placeholder={
                  isAnswered ? "Question is closed" : "Write an answer..."
                }
                disabled={isAnswered}
                value={answerText[q.id] || ""}
                onChange={e =>
                  setAnswerText(prev => ({
                    ...prev,
                    [q.id]: e.target.value
                  }))
                }
              />
              <Button
                onClick={() => submitAnswer(q.id)}
                disabled={!canSendAnswer}
              >
                Send
              </Button>
            </div>

            {/* No answers */}
            {!hasAnswers && (
              <p className="text-xs text-gray-400 mt-3">
                No answers yet
              </p>
            )}

            {/* Toggle answers */}
            <button
              disabled={!hasAnswers}
              onClick={() =>
                setOpen(prev => ({ ...prev, [q.id]: !prev[q.id] }))
              }
              className={`text-sm mt-3 ${
                hasAnswers
                  ? "text-blue-600"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              {open[q.id] ? "Hide answers" : "View answers"}
            </button>

            {/* Answers list */}
            {open[q.id] &&
              qAnswers.map(a => (
                <div key={a.id} className="mt-2 pl-3 border-l text-sm">
                  {a.message}
                  <div className="text-xs text-gray-500">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
          </Card>
        )
      })}
    </div>
  )
}