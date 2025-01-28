"use client"

import dynamic from "next/dynamic";

const CesiumGlobe = dynamic(() => import("../components/cesium-globe"), {
  ssr: false, // Prevents this component from being rendered on the server
});

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Tectonic Plate Boundaries (GPlates)</h1>
      <CesiumGlobe />
    </div>
  )
}

