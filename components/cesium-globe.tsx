"use client"
import React, { useState, useEffect, useCallback, useRef } from "react"
import * as Cesium from "cesium"
import { Card } from "@/components/ui/card"
import * as turf from "@turf/turf"

// Add this near the top of your file, after the imports
if (typeof window !== 'undefined') {
    window.CESIUM_BASE_URL = '/static/cesium';
}
// You'll need to add this to your global CSS:
// @import "cesium/Build/Cesium/Widgets/widgets.css";

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

export default function CesiumGlobe() {
    const cesiumContainer = useRef<HTMLDivElement>(null)
    const viewer = useRef<Cesium.Viewer | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentTime, setCurrentTime] = useState(140) // Default to 140 million years ago

    // Initialize Cesium viewer
    useEffect(() => {
        
        if (cesiumContainer.current && !viewer.current) {
            // Create OpenStreetMap imagery provider
            const osm = new Cesium.OpenStreetMapImageryProvider({
                url: 'https://a.tile.openstreetmap.org/'
            });

            viewer.current = new Cesium.Viewer(cesiumContainer.current, {
                // imageryProvider: osm,
                baseLayerPicker: false,
                timeline: true,
                animation: true,
                scene3DOnly: true,
                sceneMode: Cesium.SceneMode.SCENE3D,
                navigationHelpButton: false,
                geocoder: false,
                homeButton: false,
                sceneModePicker: false,
                selectionIndicator: false,
                infoBox: false,
                contextOptions: {
                    webgl: {
                        alpha: true
                    }
                }
            })

            // Configure viewer settings
            viewer.current.scene.globe.enableLighting = true
            viewer.current.scene.globe.baseColor = Cesium.Color.BLACK
            viewer.current.scene.backgroundColor = Cesium.Color.BLACK
            viewer.current.scene.globe.showGroundAtmosphere = false

            // Remove credit container
            // const creditContainer = viewer.current.bottomContainer
            // if (creditContainer) {
            //     creditContainer.style.display = 'none'
            // }

            // Initial camera position
            viewer.current.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(0, 0, 20000000)
            })

            // Set up time controller for geological time
            const startJulian = Cesium.JulianDate.fromDate(new Date(2024, 0, 1))
            const endJulian = Cesium.JulianDate.fromDate(new Date(2024, 0, 2))
            viewer.current.timeline.zoomTo(startJulian, endJulian)

            // Animation settings
            viewer.current.animation.viewModel.setShuttleRingTicks([
                -140, -120, -100, -80, -60, -40, -20, 0
            ])
        }

        return () => {
            if (viewer.current) {
                viewer.current.destroy()
                viewer.current = null
            }
        }
    }, [])

    const fetchData = useCallback(async () => {
        if (!viewer.current) return

        try {
            setLoading(true)
            
            // Clear existing data
            viewer.current.dataSources.removeAll()

            const response = await fetch(`https://gws.gplates.org/reconstruct/coastlines/?&time=${currentTime}&model=ZAHIROVIC2022`)
            if (!response.ok) throw new Error("Failed to fetch reconstructed coastlines")
            
            const data: GeoJSONResponse = await response.json()
            const validFeatures = data.features.map((feature) => turf.cleanCoords(feature))
            
            // Process features with error handling
            const simplifiedFeatures = validFeatures.reduce((acc: any[], feature) => {
                try {
                    const simplified = turf.simplify(feature, { tolerance: 0.1, highQuality: true })
                    if (turf.area(simplified) > 10000000000000) {
                        acc.push(simplified)
                    }
                } catch (err) {
                    console.warn("Failed to process feature:", err)
                }
                return acc
            }, [])

            if (simplifiedFeatures.length === 0) {
                throw new Error("No valid features found")
            }

            // Create unified geometry
            const unionPolygons = turf.union(turf.featureCollection(simplifiedFeatures))
            
            if (!unionPolygons) {
                throw new Error("Failed to process geometries")
            }

            // Custom material for landmasses
            const landMaterial = new Cesium.Material({
                fabric: {
                    type: 'Color',
                    uniforms: {
                        color: new Cesium.Color(0.4, 0.6, 0.4, 0.8)
                    }
                }
            })

            // Load GeoJSON with custom styling
            const dataSource = await Cesium.GeoJsonDataSource.load(unionPolygons, {
                stroke: Cesium.Color.WHITE.withAlpha(0.8),
                fill: new Cesium.Color(0.4, 0.6, 0.4, 0.8),
                strokeWidth: 2,
                markerSize: 0
            })

            // Add to viewer
            await viewer.current.dataSources.add(dataSource)

            // Update entities with custom material
            // dataSource.entities.values.forEach((entity) => {
            //     if (entity.polygon) {
            //         entity.polygon.material = landMaterial
            //         entity.polygon.outline = true
            //         entity.polygon.outlineColor = Cesium.Color.WHITE.withAlpha(0.8)
            //         entity.polygon.outlineWidth = 2
            //     }
            // })

            setLoading(false)
        } catch (err) {
            console.error("Error fetching reconstructed coastlines:", err)
            setError(err instanceof Error ? err.message : "An unknown error occurred")
            setLoading(false)
        }
    }, [currentTime])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Time control handler
    const handleTimeChange = useCallback((newTime: number) => {
        setCurrentTime(newTime)
    }, [])

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
            <div 
                ref={cesiumContainer} 
                className="w-full h-full"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-2 rounded">
                <input 
                    type="range" 
                    min="0" 
                    max="140" 
                    value={currentTime} 
                    onChange={(e) => handleTimeChange(Number(e.target.value))}
                    className="w-full"
                />
                <div className="text-white text-center">{currentTime} Million Years Ago</div>
            </div>
        </Card>
    )
}