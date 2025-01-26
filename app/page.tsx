import TectonicGlobe from "../components/tectonic-globe"

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Tectonic Plate Boundaries (GPlates)</h1>
      <TectonicGlobe />
    </div>
  )
}

