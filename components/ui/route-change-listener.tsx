"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function RouteChangeListener() {
  const pathname = usePathname()

  useEffect(() => {
    // When route changes, stop any nav-triggered loaders
    window.dispatchEvent(new Event("api:request:stop"))
  }, [pathname])

  return null
}


