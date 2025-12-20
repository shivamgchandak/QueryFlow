const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function createQuestion(message) {
  const res = await fetch(`${API_BASE}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
}