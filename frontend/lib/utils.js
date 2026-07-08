import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Derive the WebSocket URL from the API URL instead of requiring a
// separately-configured env var, so it can never point at a stale host
// or use the wrong ws/wss protocol (which browsers silently block as
// mixed content on an https page).
export function getWebSocketUrl(apiUrl) {
  return `${apiUrl.replace(/^http/, "ws")}/ws/questions`
}

// The backend sends naive timestamps with no timezone suffix (e.g.
// "2026-07-08T09:20:19"), which represent UTC but which `Date` would
// otherwise parse as local time. Force UTC interpretation when no
// offset/Z is present.
function toUtcDate(date) {
  if (typeof date === "string" && !/[zZ]|[+-]\d\d:\d\d$/.test(date)) {
    return new Date(`${date}Z`)
  }
  return new Date(date)
}

export function formatRelativeTime(date) {
  const diffSeconds = Math.round((toUtcDate(date).getTime() - Date.now()) / 1000)
  const divisions = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Infinity, unit: "year" },
  ]

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
  let duration = diffSeconds

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
}
