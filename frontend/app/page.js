"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { MessageSquare, Search, SendHorizontal } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL

const STATUS_FILTERS = ["All", "Pending", "Escalated", "Answered"]

const STATUS_BADGE_VARIANT = {
  Pending: "secondary",
  Escalated: "destructive",
  Answered: "success",
}

function QuestionCardSkeleton() {
  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-start gap-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24 mt-3" />
    </Card>
  )
}

export default function Forum() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [open, setOpen] = useState({})
  const [message, setMessage] = useState("")
  const [answerText, setAnswerText] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  useEffect(() => {
    const loadData = async () => {
      try {
        const qRes = await fetch(`${API_URL}/questions`)
        const qData = await qRes.json()
        setQuestions(qData)

        const allAnswers = {}
        await Promise.all(
          qData.map(async q => {
            const res = await fetch(`${API_URL}/answers/${q.id}`)
            allAnswers[q.id] = await res.json()
          })
        )
        setAnswers(allAnswers)
      } catch {
        toast.error("Couldn't load questions")
      } finally {
        setLoading(false)
      }
    }

    loadData()

    const ws = new WebSocket(`${WS_URL}`)
    ws.onmessage = e => setQuestions(JSON.parse(e.data))
    return () => ws.close()
  }, [])

  const visibleQuestions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return questions.filter(q => {
      const matchesStatus = statusFilter === "All" || q.status === statusFilter
      const matchesSearch = !term || q.message.toLowerCase().includes(term)
      return matchesStatus && matchesSearch
    })
  }, [questions, search, statusFilter])

  const submitQuestion = async () => {
    if (!message.trim()) {
      toast.error("Question cannot be empty")
      return
    }

    try {
      setSubmitting(true)
      await fetch(`${API_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      })
      setMessage("")
      toast.success("Question submitted")
    } catch {
      toast.error("Failed to submit question")
    } finally {
      setSubmitting(false)
    }
  }

  const submitAnswer = async (id) => {
    if (!answerText[id]?.trim()) {
      toast.error("Answer cannot be empty")
      return
    }

    try {
      await fetch(`${API_URL}/answers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: answerText[id] })
      })

      setAnswerText(prev => ({ ...prev, [id]: "" }))

      const res = await fetch(`${API_URL}/answers/${id}`)
      const data = await res.json()
      setAnswers(prev => ({ ...prev, [id]: data }))
      setOpen(prev => ({ ...prev, [id]: true }))

      toast.success("Answer submitted")
    } catch {
      toast.error("Failed to submit answer")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Ask a question</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Submit a question below and get answers in real time.
        </p>
      </div>

      {/* Ask Question */}
      <Card className="p-4 mb-8">
        <Textarea
          placeholder="What would you like to ask?"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="min-h-20"
        />
        <div className="flex justify-end mt-3">
          <Button onClick={submitQuestion} disabled={!message.trim() || submitting}>
            <SendHorizontal className="size-4" />
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Card>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(status => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <>
          <QuestionCardSkeleton />
          <QuestionCardSkeleton />
          <QuestionCardSkeleton />
        </>
      )}

      {/* Empty states */}
      {!loading && questions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="size-8 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No questions yet</p>
          <p className="text-sm">Be the first to ask something.</p>
        </div>
      )}

      {!loading && questions.length > 0 && visibleQuestions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="size-8 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No matching questions</p>
          <p className="text-sm">Try a different search term or filter.</p>
        </div>
      )}

      {/* Questions */}
      {visibleQuestions.map(q => {
        const qAnswers = answers[q.id] || []
        const hasAnswers = qAnswers.length > 0
        const isAnswered = q.status === "Answered"
        const canSendAnswer = !isAnswered && answerText[q.id]?.trim()

        return (
          <Card key={q.id} className="p-4 mb-4">
            <div className="flex justify-between items-start gap-3">
              <p className="font-medium">{q.message}</p>
              <Badge variant={STATUS_BADGE_VARIANT[q.status] ?? "secondary"}>
                {q.status}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              {formatRelativeTime(q.created_at)}
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
                onKeyDown={e => {
                  if (e.key === "Enter" && canSendAnswer) submitAnswer(q.id)
                }}
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
              <p className="text-xs text-muted-foreground mt-3">
                No answers yet
              </p>
            )}

            {/* Toggle answers */}
            {hasAnswers && (
              <button
                onClick={() =>
                  setOpen(prev => ({ ...prev, [q.id]: !prev[q.id] }))
                }
                className="text-sm mt-3 text-primary hover:underline"
              >
                {open[q.id]
                  ? "Hide answers"
                  : `View ${qAnswers.length} answer${qAnswers.length > 1 ? "s" : ""}`}
              </button>
            )}

            {/* Answers list */}
            {open[q.id] &&
              qAnswers.map(a => (
                <div key={a.id} className="mt-2 pl-3 border-l text-sm">
                  {a.message}
                  <div className="text-xs text-muted-foreground">
                    {formatRelativeTime(a.created_at)}
                  </div>
                </div>
              ))}
          </Card>
        )
      })}
    </div>
  )
}
