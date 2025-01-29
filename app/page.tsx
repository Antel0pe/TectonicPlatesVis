"use client"

import dynamic from "next/dynamic"

const ReconstructedCoastlinesMap = dynamic(() => import("../components/ReconstructedCoastlinesMap"), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">Loading map...</div>,
})

export default function Home() {
  return (
    <main className="h-screen">
      <ReconstructedCoastlinesMap />
    </main>
  )
}

