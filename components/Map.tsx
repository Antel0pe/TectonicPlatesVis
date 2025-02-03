"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet"
import { PlayCircle, PauseCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import "leaflet/dist/leaflet.css"
import modelsConfig from "../models-config.json"
import type { GeoJsonObject } from 'geojson';
import ReconstructedCoastlinesMap from "./ReconstructedCoastlinesMap"
import ReconstructedPointsMap from "./ReconstructedPointsMap"
import ElevationMap from "./ElevationMap"

export interface ModelConfig {
    start: number
    end: number
    filepath: string
}

const LAYERS = {
    tectonicPlates: {
        name: "Tectonic Plates",
        component: ReconstructedCoastlinesMap
    },
    mammalFossils: {
        name: "Mammal Fossils",
        component: ReconstructedPointsMap
    },
    elevation: {
        name: "Elevation",
        component: ElevationMap
    }
};

type LayerVisibility = Record<keyof typeof LAYERS, boolean>;
const Map: React.FC = () => {
    const [model, setModel] = useState<keyof typeof modelsConfig>("ZAHIROVIC2022")
    const [time, setTime] = useState(modelsConfig[model].start)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [visibleLayers, setVisibleLayers] = useState<LayerVisibility>(
        Object.keys(LAYERS).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    const currentModelConfig = modelsConfig[model] as ModelConfig


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
            }, 1000)
        }
        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [isPlaying, isLoading, currentModelConfig])

    const handlePlayPause = () => {
        if (!isPlaying && time <= currentModelConfig.end) {
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
                    style={{ height: "100%", width: "100%" }}
                >
                    <LayersControl position="topright">
                        {(Object.keys(LAYERS)  as Array<keyof typeof LAYERS>).map(key => {
                            const layer = LAYERS[key as keyof typeof LAYERS];
                            return (
                                <LayersControl.Overlay
                                    key={key}
                                    checked={visibleLayers[key]}
                                    name={layer.name}
                                >
                                    {visibleLayers[key] && (
                                        <layer.component
                                            model={model}
                                            time={time}
                                            setIsLoading={setIsLoading}
                                        />
                                    )}
                                </LayersControl.Overlay>)
                        })}
                    </LayersControl>
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

export default Map

