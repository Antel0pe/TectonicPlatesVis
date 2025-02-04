"use client"
import React, { useState, useEffect, useCallback, type Dispatch } from "react"
import { GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { GeoJsonObject, Feature, Geometry, FeatureCollection } from 'geojson'
import modelsConfig from "../models-config.json"
import { ModelConfig } from "./Map"
import L from 'leaflet'
import type { LatLng } from 'leaflet'
import { fileExists } from "./ReconstructedCoastlinesMap"

interface Props {
    time: number;
    setIsLoading: Dispatch<boolean>;
}

const ElevationMap = ({ time, setIsLoading }: Props) => {
    const [points, setPoints] = useState<GeoJsonObject | null>(null)

    const fetchAndProcessData = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/data/elevation-geojson/${time}.geojson`)
            if (!response.ok) throw new Error("Failed to fetch local elevation file")
            const pointsData = await response.json()
            console.log(pointsData)
            setPoints(pointsData)
        } catch (error) {
            console.error('Error fetching and processing data:', error)
            setPoints(null)
        } finally {
            setIsLoading(false)
        }
    }, [time, setIsLoading])

    useEffect(() => {
        fetchAndProcessData()
    }, [fetchAndProcessData])

    return points ? (
        <GeoJSON
            key={`${time}-elevation`}
            data={points}
            style={(feature) => ({
                fillColor: feature?.properties?.color,
                fillOpacity: 0.8,
                color: '#000',
                weight: 1,
            })}
        />
    ) : null
}

export default ElevationMap