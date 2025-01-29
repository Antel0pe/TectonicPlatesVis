"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import { PlayCircle, PauseCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import "leaflet/dist/leaflet.css"
import modelsConfig from "../models-config.json"
import type { GeoJsonObject } from 'geojson';



interface ModelConfig {
  start: number
  end: number
  filepath: string
}

const fileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch (error) {
    console.error("Error checking file existence:", error)
    return false
  }
}

const ReconstructedCoastlinesMap: React.FC = () => {
  const [coastlines, setCoastlines] = useState<GeoJsonObject | null>(null)
  const [model, setModel] = useState<keyof typeof modelsConfig>("ZAHIROVIC2022")
  const [time, setTime] = useState(modelsConfig[model].start)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const currentModelConfig = modelsConfig[model] as ModelConfig

  const fetchCoastlines = useCallback(
    async (currentTime: number) => {
      setIsLoading(true)
      try {
        const filePath = currentModelConfig.filepath.replace("_", currentTime.toString())
        const fileExistsLocally = await fileExists(filePath)

        let data: GeoJsonObject

        if (fileExistsLocally) {
          const response = await fetch(filePath)
          if (!response.ok) throw new Error("Failed to fetch local coastlines file")
          data = await response.json()
        } else {
          // File doesn't exist locally, fallback to API request
          const apiUrl = `https://gws.gplates.org/reconstruct/coastlines/?&time=${currentTime}&model=${model}`
          const response = await fetch(apiUrl)
          if (!response.ok) throw new Error(`Failed to fetch reconstructed coastlines from API: ${response.statusText}`)
          data = await response.json()
        }

        setCoastlines(data)
      } catch (error) {
        console.error("Error fetching coastlines:", error)
        // Set coastlines to null or a default value if the fetch fails
        setCoastlines(null)
      } finally {
        setIsLoading(false)
      }
    },
    [model, currentModelConfig],
  )

  useEffect(() => {
    fetchCoastlines(time)
  }, [time, fetchCoastlines])

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null
    if (isPlaying && !isLoading) {
      timeout = setTimeout(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 10
          if (newTime < currentModelConfig.end) {
            setIsPlaying(false)
            return currentModelConfig.end
          }
          return newTime
        })
      }, 5000)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [isPlaying, isLoading, currentModelConfig])

  const handlePlayPause = () => {
    if (!isPlaying) {
      setTime(currentModelConfig.start)
    }
    setIsPlaying(!isPlaying)
  }

  const handleModelChange = (newModel: keyof typeof modelsConfig) => {
    setModel(newModel)
    setTime(modelsConfig[newModel].start)
    setIsPlaying(false)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow">
              <MapContainer
                  center={[0, 0]}
                  zoom={2}
                  style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {coastlines && (
            <GeoJSON
              key={time}
              data={coastlines}
              style={() => ({
                color: "#111",
                weight: 1,
                fillColor: "rgba(0, 100, 200, 0.7)",
                fillOpacity: 0.7,
              })}
            />
          )}
        </MapContainer>
      </div>
      <div className="bg-black text-white p-4 flex items-center space-x-4">
        <Select value={model} onValueChange={handleModelChange}>
          <SelectTrigger className="w-[180px] text-white bg-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black border-white z-[500]">
            {Object.keys(modelsConfig).map((modelName) => (
              <SelectItem
                key={modelName}
                value={modelName}
                className="text-white data-[state=checked]:bg-white data-[state=checked]:text-black hover:bg-gray-800"
              >
                {modelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={handlePlayPause} disabled={isLoading}>
          {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
        </Button>
        <div className="flex-grow flex items-center">
          <span className="mr-2 whitespace-nowrap">{currentModelConfig.start} Ma</span>
          <Slider
            value={[currentModelConfig.start - time]}
            min={0}
            max={currentModelConfig.start - currentModelConfig.end}
            step={10}
            onValueChange={(value) => setTime(currentModelConfig.start - value[0])}
            className="w-full"
          />
          <span className="ml-2 whitespace-nowrap">{currentModelConfig.end} Ma</span>
        </div>
        <span className="min-w-[5ch] text-right whitespace-nowrap">{time} Ma</span>
      </div>
    </div>
  )
}

export default ReconstructedCoastlinesMap

