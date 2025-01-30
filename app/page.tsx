"use client"

import dynamic from "next/dynamic"

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">Loading map...</div>,
})

export default function Home() {
  return (
    <main className="h-screen">
      <Map />
    </main>
  )
}

