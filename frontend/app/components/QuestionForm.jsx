"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createQuestion } from "../lib/api";

export default function QuestionForm() {
  const [message, setMessage] = useState("");

  async function submit() {
    if (!message.trim()) return alert("Question cannot be empty");
    await createQuestion(message);
    setMessage("");
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Ask a question..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button onClick={submit}>Submit</Button>
    </div>
  );
}