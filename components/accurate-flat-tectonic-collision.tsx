"use client"

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Environment, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from "@/components/ui/button"
import { Play, Pause } from 'lucide-react'

const FlatPlate = ({ isIndian = false, color, name }) => {
  const mesh = useRef()
  const [hovered, setHovered] = React.useState(false)

  const shape = useMemo(() => {
    const shape = new THREE.Shape()
    if (isIndian) {
      shape.moveTo(0, 0)
      shape.lineTo(4, 0)
      shape.lineTo(5, 2)
      shape.lineTo(4.5, 4)
      shape.lineTo(3, 5)
      shape.lineTo(1, 4.5)
      shape.lineTo(0, 3)
    } else {
      shape.moveTo(0, 0)
      shape.lineTo(5, 0)
      shape.lineTo(5, 5)
      shape.lineTo(4, 4.5)
      shape.lineTo(3, 3)
      shape.lineTo(1.5, 2)
      shape.lineTo(0, 2.5)
    }
    shape.lineTo(0, 0)
    return shape
  }, [isIndian])

  const geometry = useMemo(() => new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.1,
    bevelEnabled: false,
  }), [shape])

  useFrame((state) => {
    if (isIndian) {
      mesh.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <group position={isIndian ? [-2.5, 0, 0] : [2.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh
        ref={mesh}
        geometry={geometry}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={hovered ? 'hotpink' : color} />
      </mesh>
      <Text
        position={[2, 0, 0.2]}
        rotation={[Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  )
}

const Himalayas = () => {
  const mesh = useRef()

  useFrame((state) => {
    mesh.current.scale.z = 1 + Math.sin(state.clock.elapsedTime) * 0.1
  })

  return (
    <group position={[0, 0, 0.1]}>
      <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.5, 0.2, 32]} />
        <meshStandardMaterial color="#795548" />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Himalayas
      </Text>
    </group>
  )
}

const Ocean = () => {
  const texture = useTexture('/assets/3d/texture_earth.jpg')
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[15, 15]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

const AccurateFlatTectonicCollision = () => {
  const [isPlaying, setIsPlaying] = React.useState(true)

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <FlatPlate isIndian={true} color="#FFCC80" name="Indian Plate" />
        <FlatPlate color="#A5D6A7" name="Eurasian Plate" />
        <Himalayas />
        <Ocean />
        <OrbitControls enablePan={false} />
        <Environment preset="sunset" background />
      </Canvas>
      <Button
        className="absolute bottom-4 right-4"
        onClick={toggleAnimation}
        variant="outline"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 p-2 rounded">
        <h2 className="text-xl font-bold">Accurate Flat Tectonic Plate Collision</h2>
        <p className="text-sm mt-2">
          This 3D animation shows a more accurate representation of the Indian Plate colliding with the Eurasian Plate,
          leading to the formation of the Himalayas. The plates are now correctly displayed lying flat with irregular boundaries.
          Use your mouse or touch to rotate the view.
        </p>
      </div>
    </div>
  )
}

export default AccurateFlatTectonicCollision

