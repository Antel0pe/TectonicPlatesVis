"use client"

import type React from "react"
import { useState, useEffect, useCallback, Dispatch } from "react"
import { GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import modelsConfig from "../models-config.json"
import type { GeoJsonObject } from 'geojson';
import { ModelConfig } from "./Map"



const fileExists = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: "HEAD" })
        return response.ok
    } catch (error) {
        console.error("Error checking file existence:", error)
        return false
    }
}

interface Props {
    model: keyof typeof modelsConfig,
    time: number,
    setIsLoading: Dispatch<boolean>
}

const ReconstructedCoastlinesMap  = ( { model, time, setIsLoading }: Props) => {
    const [coastlines, setCoastlines] = useState<GeoJsonObject | null>(null)

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


    return (

        coastlines && (
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
        )
                
    )
}

export default ReconstructedCoastlinesMap

