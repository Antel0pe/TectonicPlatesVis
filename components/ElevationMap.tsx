import React, { useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection, Point } from 'geojson'

const generateMockData = () => {
  const features: Feature[] = []
  
  // Generate points in a grid
  for (let lat = -89; lat <= 89; lat += 2) {
    for (let lon = -179; lon <= 179; lon += 2) {
      // Generate random elevation between -6000 (deep ocean) and 8000 (high mountains)
      const elevation = Math.random() * 14000 - 6000
      
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties: {
          elevation,
        }
      })
    }
  }

  return {
    type: 'FeatureCollection',
    features
  } as FeatureCollection
}

const getElevationColor = (elevation: number) => {
  // Color scheme: deep blue for deep ocean to white for high mountains
  if (elevation < -4000) return '#000080' // Deep blue for deep ocean
  if (elevation < -2000) return '#0000FF' // Blue for ocean
  if (elevation < 0) return '#4169E1'     // Royal blue for shallow water
  if (elevation < 500) return '#90EE90'   // Light green for lowlands
  if (elevation < 2000) return '#228B22'  // Forest green for hills
  if (elevation < 4000) return '#8B4513'  // Brown for mountains
  return '#FFFFFF'                        // White for peaks
}

const ElevationMap = () => {
  const points = useMemo(() => generateMockData(), [])

  return (
    <GeoJSON
      data={points}
      pointToLayer={(feature, latlng) => {
        const elevation = feature.properties?.elevation || 0
        
        return L.circleMarker(latlng, {
          radius: 4,
          fillColor: getElevationColor(elevation),
          color: '#000',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.8,
        })
      }}
    />
  )
}

export default ElevationMap

// ------------------------
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"

interface ElevationData {
  type: "FeatureCollection"
  features: Array<{
    type: "Feature"
    properties: {
      elevation: number
    }
    geometry: {
      type: "Polygon"
      coordinates: number[][][]
    }
  }>
}

const generateElevationData = (): ElevationData => {
  const features = []
  for (let lat = -89; lat <= 89; lat += 2) {
    for (let lon = -179; lon <= 179; lon += 2) {
      const elevation = Math.sin(lat / 10) * Math.cos(lon / 10) * 5000 // Generate elevation
      features.push({
        type: "Feature",
        properties: {
          elevation: elevation,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [lon, lat],
              [lon + 2, lat],
              [lon + 2, lat + 2],
              [lon, lat + 2],
              [lon, lat],
            ],
          ],
        },
      })
    }
  }
  return {
    type: "FeatureCollection",
    features: features,
  }
}

const ElevationMap1: React.FC = () => {
  const [data, setData] = useState<ElevationData | null>(null)

  useEffect(() => {
    setData(generateElevationData())
  }, [])

  const getColor = (elevation: number): string => {
    if (elevation < 0) return `rgb(0, 0, ${Math.min(255, Math.abs(elevation) / 20)})`
    if (elevation < 1000) return `rgb(${elevation / 4}, 255, 0)`
    if (elevation < 3000) return `rgb(255, ${255 - (elevation - 1000) / 8}, 0)`
    return `rgb(255, 0, 0)`
  }

  const style = (feature: any) => {
    return {
      fillColor: getColor(feature.properties.elevation),
      weight: 0,
      opacity: 1,
      color: "white",
      fillOpacity: 0.7,
    }
  }

  return (
    <MapContainer center={[20, 0]} zoom={3} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {data && (
        <GeoJSON
          data={data}
          style={style}
          onEachFeature={(feature, layer) => {
            layer.bindPopup(`Elevation: ${feature.properties.elevation.toFixed(2)}m`)
          }}
        />
      )}
    </MapContainer>
  )
}

export default ElevationMap1

