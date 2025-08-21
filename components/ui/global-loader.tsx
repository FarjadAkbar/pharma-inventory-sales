"use client"

import { useEffect, useState } from "react"

export function GlobalLoader() {
  const [inFlight, setInFlight] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onStart = () => setInFlight((c) => c + 1)
    const onStop = () => setInFlight((c) => Math.max(0, c - 1))

    window.addEventListener("api:request:start", onStart)
    window.addEventListener("api:request:stop", onStop)
    return () => {
      window.removeEventListener("api:request:start", onStart)
      window.removeEventListener("api:request:stop", onStop)
    }
  }, [])

  useEffect(() => {
    if (inFlight > 0) {
      setVisible(true)
    } else {
      const t = setTimeout(() => setVisible(false), 150)
      return () => clearTimeout(t)
    }
  }, [inFlight])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="h-1 w-full bg-primary/20">
        <div className="h-1 bg-primary animate-[progress_1s_linear_infinite]" style={{ width: "40%" }} />
      </div>
      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(20%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}


