"use client";

import { useEffect, useState } from "react";

export function useQuestionsSocket() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setQuestions(data);
    };

    return () => ws.close();
  }, []);

  return questions;
}