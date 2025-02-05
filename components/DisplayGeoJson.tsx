"use client"
import React, { useState, useEffect, useCallback, type Dispatch } from "react"
import { GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { GeoJsonObject, Feature, Geometry, FeatureCollection } from 'geojson'
import modelsConfig from "../models-config.json"
import { ModelConfig } from "./Map"
import L from 'leaflet'
import type { LatLng } from 'leaflet'

interface Props {
    fileDirectory: string;
    model: keyof typeof modelsConfig;
    time: number;
    setIsLoading: Dispatch<boolean>;
}

const DisplayGeoJsonMap = ({ fileDirectory, model, time, setIsLoading }: Props) => {
    const [data, setData] = useState<GeoJsonObject | null>(null)

    const fetchAndProcessData = useCallback(async () => {
        setIsLoading(true)
        try {
            const fileName = `${fileDirectory}${time}.geojson`
            const response = await fetch(fileName)
            if (!response.ok) throw new Error(`Failed to fetch ${fileName}`)
            const data = await response.json()
            setData(data)
        } catch (error) {
            console.error('Error fetching and processing data:', error)
            setData(null)
        } finally {
            setIsLoading(false)
        }
    }, [time, model, setIsLoading])

    useEffect(() => {
        fetchAndProcessData()
    }, [fetchAndProcessData])

    return data ? (
        <GeoJSON
            key={`${time}-${model}-${fileDirectory}`}
            data={data}
        />
    ) : null
}

export default DisplayGeoJsonMap