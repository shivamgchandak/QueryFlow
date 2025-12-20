"use client";

import { useEffect, useState } from "react";

export function useQuestionsSocket() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/questions");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setQuestions(data);
    };

    return () => ws.close();
  }, []);

  return questions;
}