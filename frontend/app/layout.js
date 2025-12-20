import "./globals.css"
import Navbar from "./components/Navbar"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}