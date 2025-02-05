"use client"
import React, { useState, useEffect, useCallback, type Dispatch } from "react"
import { GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { GeoJsonObject, Feature, Geometry, FeatureCollection } from 'geojson'
import modelsConfig from "../models-config.json"
import { ModelConfig } from "./Map"
import L from 'leaflet'
import type { LatLng } from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster';

interface Props {
    model: keyof typeof modelsConfig;
    time: number;
    setIsLoading: Dispatch<boolean>;
}

const ReconstructedPointsMap = ({ model, time, setIsLoading }: Props) => {
    const [points, setPoints] = useState<GeoJsonObject | null>(null)
    const currentModelConfig = modelsConfig[model] as ModelConfig

    const fetchAndProcessData = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/data/reconstructedPoints/${time}.geojson`)
            if (!response.ok) throw new Error("Failed to fetch local reconstructed points file")
            const pointsData = await response.json()
            console.log(pointsData)
            setPoints(pointsData)
        } catch (error) {
            console.error('Error fetching and processing data:', error)
            setPoints(null)
        } finally {
            setIsLoading(false)
        }
    }, [time, model, setIsLoading])

    useEffect(() => {
        fetchAndProcessData()
    }, [fetchAndProcessData])

    return points ? (
        <MarkerClusterGroup
            iconCreateFunction={(cluster) => {
                return L.divIcon({
                    html: `<div class="bg-white/80 border-2 border-gray-600 rounded-full w-10 h-10 flex items-center justify-center">${cluster.getChildCount()}</div>`,
                    className: ''
                });
            }}
        >
            <GeoJSON
                key={`${time}-${model}`}
                data={points}
                pointToLayer={(feature, latlng: LatLng) => {
                    return L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: feature['properties']['color'],
                        color: '#000',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8,
                        pane: 'overlayPane'
                    });
                }}

            />
        </MarkerClusterGroup>
    ) : null
}

export default ReconstructedPointsMap