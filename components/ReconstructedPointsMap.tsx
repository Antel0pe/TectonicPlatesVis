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

            const filePath = `/data/paleobiodb_cynodontia,mammalia/${time}.json`
            const fileExistsLocally = await fileExists(filePath)

            let paleobioData
            if (fileExistsLocally) {
                const response = await fetch(filePath)
                if (!response.ok) throw new Error("Failed to fetch local paleobiodb file")
                paleobioData = await response.json()
            } else {
                // File doesn't exist locally, fallback to API request
                // Calculate min_ma based on time prop
                const timeStr = time === 0 ? `max_ma=${1}&min_ma=${0}` : `max_ma=${time}&min_ma=${time - 9}`

                // Fetch paleobio data
                const paleobioResponse = await fetch(
                    `https://paleobiodb.org/data1.2/occs/list.json?base_name=cynodontia,mammalia&${timeStr}&show=coords,loc,time,phylo`
                )
                if (!paleobioResponse.ok) throw new Error(`Failed to fetch paleobiodb data from API: ${paleobioResponse.statusText}`)
                paleobioData = await paleobioResponse.json()
            }

            // Create GeoJSON FeatureCollection from paleobio data
            const features: Feature[] = paleobioData
                .filter((record: any) => record.lng && record.lat)
                .map((record: any): Feature => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(record.lng), parseFloat(record.lat)]
                    },
                    properties: {
                        id: record.occurrence_no,
                        name: record.taxon_name,
                        age: record.max_ma,
                        color: record.color
                    }
                }))
            // console.log(features)

            const featureCollection: FeatureCollection = {
                type: 'FeatureCollection',
                features: features
            }

            if (features.length === 0) {
                console.error('No valid coordinates found in paleobio data')
                return
            }

            // Use Next.js API route instead of calling GPlates directly
            const reconstructResponse = await fetch('/api/reconstruct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feature_collection: featureCollection,
                    time: time,
                    model: model
                })
            })

            // console.log('sending to api')
            // console.log(JSON.stringify({
            //     feature_collection: featureCollection,
            //     reconstruction_time: time,
            //     model: model
            // }))

            if (!reconstructResponse.ok) {
                throw new Error('Failed to fetch reconstructed points')
            }
            const pointsData = await reconstructResponse.json()
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
    ) : null
}

export default ReconstructedPointsMap