"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Inbox, Search } from "lucide-react"
import { formatRelativeTime, getWebSocketUrl } from "@/lib/utils"

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
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  // Auth guard
  useEffect(() => {
    const t = localStorage.getItem("token")
    if (!t) {
      window.location.href = "/login"
    } else {
      setToken(t)
    }
  }, [])

  // Fetch questions + answers + WebSocket
  useEffect(() => {
    if (!token) return

    const load = async () => {
      try {
        const qRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`)
        const qData = await qRes.json()
        setQuestions(qData)

        const allAnswers = {}
        await Promise.all(
          qData.map(async q => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answers/${q.id}`)
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

    load()

    const ws = new WebSocket(getWebSocketUrl(process.env.NEXT_PUBLIC_API_URL))
    ws.onmessage = e => setQuestions(JSON.parse(e.data))

    return () => ws.close()
  }, [token])

  const visibleQuestions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return questions.filter(q => {
      const matchesStatus = statusFilter === "All" || q.status === statusFilter
      const matchesSearch = !term || q.message.toLowerCase().includes(term)
      return matchesStatus && matchesSearch
    })
  }, [questions, search, statusFilter])

  // Update Status
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/${id}/status?status=${status}`,
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
    } catch {
      toast.error("Failed to update status")
    }
  }

  if (!token) return null

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Moderate and respond to incoming questions.
        </p>
      </div>

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
          <Inbox className="size-8 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No questions yet</p>
          <p className="text-sm">New questions will show up here.</p>
        </div>
      )}

      {!loading && questions.length > 0 && visibleQuestions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="size-8 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No matching questions</p>
          <p className="text-sm">Try a different search term or filter.</p>
        </div>
      )}

      {visibleQuestions.map(q => {
        const qAnswers = answers[q.id] || []
        const hasAnswers = qAnswers.length > 0
        const isAnswered = q.status === "Answered"
        const isEscalated = q.status === "Escalated"

        return (
          <Card key={q.id} className="p-4 mb-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="font-medium">{q.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(q.created_at)}
                </p>
              </div>

              <Badge variant={STATUS_BADGE_VARIANT[q.status] ?? "secondary"}>
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
              <p className="text-xs text-muted-foreground mt-2">
                Cannot mark answered until at least one answer exists
              </p>
            )}
          </Card>
        )
      })}
    </div>
  )
}
