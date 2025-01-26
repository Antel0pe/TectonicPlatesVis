"use client"

import React, { useState, useEffect, useCallback } from "react"
import Globe from "react-globe.gl"
import { Card } from "@/components/ui/card"

interface GeoJSONFeature {
  type: string
  geometry: {
    type: string
    coordinates: number[][][]
  }
  properties?: Record<string, any>
}

interface GeoJSONResponse {
  type: string
  features: GeoJSONFeature[]
}

export default function PaleoGeographyGlobe() {
  const [globeData, setGlobeData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("https://gws.gplates.org/reconstruct/coastlines/?&time=140&model=ZAHIROVIC2022")
      if (!response.ok) throw new Error("Failed to fetch reconstructed coastlines")
      const data: GeoJSONResponse = await response.json()

      const coastlines = data.features
        .filter(
          (feature) =>
            feature.geometry?.coordinates?.length > 0 &&
            feature.geometry.coordinates.every(
              (polygon) => polygon.length > 0 && polygon.every((coord) => Array.isArray(coord) && coord.length >= 2),
            ),
        )
        .flatMap((feature, featureIndex) =>
          feature.geometry.coordinates.map((polygon, polygonIndex) => ({
            coords: polygon,
            properties: {
              name: `Coastline ${featureIndex + 1}-${polygonIndex + 1}`,
              color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            },
          })),
        )

      setGlobeData(coastlines)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching reconstructed coastlines:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (error) {
    return (
      <Card className="w-full h-[calc(100vh-100px)] bg-black/90 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </Card>
    )
  }

  return (
    <Card className="w-full h-[calc(100vh-100px)] bg-black/90 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white">Loading reconstructed coastlines...</div>
        </div>
      )}
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundColor="rgba(0,0,0,0)"
        pathsData={globeData}
        pathPoints="coords"
        pathPointLat={(p) => p[1]}
        pathPointLng={(p) => p[0]}
        // pathColor={(path) => path.properties.color}
        // pathLabel={(path) => path.properties.name}
        pathDashLength={0.1}
        pathDashGap={0.008}
        pathDashAnimateTime={12000}
        pathStroke={1}
        // pathAltitude={0.001}
        width={window.innerWidth}
        height={window.innerHeight - 100}
      />
    </Card>
  )
}

