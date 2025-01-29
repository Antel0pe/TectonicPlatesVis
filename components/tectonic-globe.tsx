"use client"
import React, { useState, useEffect, useCallback } from "react"
import Globe from "react-globe.gl"
import { Card } from "@/components/ui/card"
import polygonClipping from "polygon-clipping"
import * as turf from "@turf/turf";



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
    const [polygonData, setPolygonData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch("https://gws.gplates.org/reconstruct/coastlines/?&time=140&model=ZAHIROVIC2022")
            if (!response.ok) throw new Error("Failed to fetch reconstructed coastlines")
            const data: GeoJSONResponse = await response.json()
            const validFeatures = data.features.map((feature) => turf.cleanCoords(feature));
            let simplifiedData = []
            for (const f of validFeatures) {
                try {
                    let simplified = turf.simplify(f, { tolerance: 1, highQuality: true, })
                    simplifiedData.push(simplified)
                } catch (err) {
                    console.error(err)
                    console.error(f)
                }
            }
            const bigPolygons = simplifiedData.filter((d) => turf.area(d) > 10000000000000)
            console.log(bigPolygons)
            console.log(bigPolygons.filter(f => turf.booleanValid(f)));

            const unionPolygons = turf.union(turf.featureCollection(bigPolygons))
            console.log(unionPolygons)

            // const enhanced = turf.buffer(unionPolygons, 0, { steps: 8 });
            // console.log(enhanced)




            // const polygons: [number, number][][][] = unionPolygons
            //     .filter(feature =>
            //         feature.geometry?.coordinates?.length > 0 &&
            //         feature.geometry.coordinates.every(polygon =>
            //             polygon.length > 0 && polygon.every(coord =>
            //                 Array.isArray(coord) && coord.length >= 2
            //             )
            //         )
            //     )
            //     .map((feature, index) => ({
            //         type: feature.type,
            //         geometry: feature.geometry,
            //         properties: {
            //             capColor: 'rgba(200, 255, 0, 0.6)',
            //             sideColor: 'rgba(0, 100, 0, 0.15)',
            //             strokeColor: 'rgba(0, 0, 0, 0)',
            //             altitude: 0.0001 + Math.random() * 0.001
            //         }
            //     }));
            //     .map((feature) => {
            //         return [feature.geometry.coordinates[0].map((coord: any) => [coord[0], coord[1]] as [number, number])]
            //     })

            // console.log(polygons)

            // const mergedPolygon = polygonClipping.union(...[polygons]);
            // console.log(mergedPolygon)
            // const mergedGeometry = mergedPolygon.map((p) => ({
            //     type: 'Feature',
            //     geometry: {
            //         type: "MultiPolygon",
            //         coordinates: [p]
            //     }
            // }))

            // console.log(mergedGeometry)

            const testPolygon = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                -49,
                                -37
                            ],
                            [
                                -24,
                                -46
                            ],
                            [
                                -24,
                                -45
                            ],
                            [
                                -32,
                                -61
                            ],
                            [
                                4,
                                -62
                            ],
                            [
                                16,
                                -34
                            ],
                            [
                                -11,
                                -21
                            ],
                            [
                                -11,
                                -22
                            ],
                            [
                                -49,
                                -8
                            ],
                            [
                                -49,
                                -37
                            ]
                        ]
                    ]
                },
            }
            // const smoothedPolygon = densifyPolygon(testPolygon);
            // setPolygonData([smoothedPolygon]);
            // setPolygonData([testPolygon]);

            setPolygonData([unionPolygons])
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

    const densifyPolygon = (feature: any) => {
        const coords = feature.geometry.coordinates[0];
        let denseCoords = [];

        for (let i = 0; i < coords.length - 1; i++) {
            const start = turf.point(coords[i]);
            const end = turf.point(coords[i + 1]);
            const arc = turf.greatCircle(start, end, { npoints: 20 });
            denseCoords.push(...arc.geometry.coordinates);
        }

        return {
            ...feature,
            geometry: {
                ...feature.geometry,
                coordinates: [[...denseCoords, denseCoords[0]]] // Close the polygon
            }
        };
    };



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
                rendererConfig={{
                    // logarithmicDepthBuffer: true,
                    // depth: false,
                }}
                // globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                // backgroundColor="rgba(0,0,0,1)"
                // atmosphereColor="rgba(0,0,0,1)"
                polygonsData={polygonData}
            // polygonGeoJsonGeometry={(d:any) => d.geometry}
            // polygonCapColor={(obj: any) => obj.properties?.capColor || 'rgba(255, 0, 0, 0.8)'}
            // polygonSideColor={(obj: any) => obj.properties?.sideColor || 'rgba(0,0,0,0)'}
            // polygonStrokeColor={(obj: any) => obj.properties?.strokeColor || 'rgba(0,0,0,0)'}
            polygonCapColor={() => 'rgba(255, 0, 0, 0.8)'}
            polygonSideColor={() => 'rgba(255, 0, 0, 0.3)'}
            // polygonAltitude={() => 0.00001}
            // showAtmosphere={true}
            // atmosphereColor="rgba(0,0,0,0)"
            polygonAltitude={0.01}
            // polygonAltitude={(obj: any) => obj.properties?.altitude}
            // polygonStrokeColor={() => '#111'}
            // polygonAltitude={0}
            // polygonsTransitionDuration={1000}

            // width={window.innerWidth}
            // height={window.innerHeight - 100}
            />
        </Card>
    )
}