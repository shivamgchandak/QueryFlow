"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function QuestionCard({ question }) {
  async function markAnswered() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Admin login required");
      return;
    }

    await fetch(
      `http://127.0.0.1:8000/questions/${question.id}/answer`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  return (
    <Card className="p-4 flex justify-between items-center">
      <div>
        <p className="font-medium">{question.message}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(question.created_at).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">{question.status}</Badge>

        {question.status !== "Answered" && (
          <Button size="sm" onClick={markAnswered}>
            Mark Answered
          </Button>
        )}
      </div>
    </Card>
  );
}