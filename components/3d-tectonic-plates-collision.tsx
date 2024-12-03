"use client"

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Environment, useTexture } from '@react-three/drei'
import { Button } from "@/components/ui/button"
import { Play, Pause } from 'lucide-react'

const Plate = ({ position, color, name, isIndian = false }) => {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (isIndian) {
      mesh.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5
    }
  })

  return (
    <mesh
      ref={mesh}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[5, 0.5, 3]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </mesh>
  )
}

const Himalayas = ({ position }) => {
  const mesh = useRef()

  useFrame((state) => {
    mesh.current.scale.y = 1 + Math.sin(state.clock.elapsedTime) * 0.2
  })

  return (
    <mesh ref={mesh} position={position}>
      <coneGeometry args={[0.5, 1, 4]} />
      <meshStandardMaterial color="#795548" />
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Himalayas
      </Text>
    </mesh>
  )
}

const Ocean = () => {
  const texture = useTexture('/assets/3d/texture_earth.jpg')
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

const TectonicPlatesCollision = () => {
  const [isPlaying, setIsPlaying] = useState(true)

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Plate position={[-2.5, 0, 0]} color="#FFCC80" name="Indian Plate" isIndian={true} />
        <Plate position={[2.5, 0, 0]} color="#A5D6A7" name="Eurasian Plate" />
        <Himalayas position={[0, 0.25, 0]} />
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
        <h2 className="text-xl font-bold">Himalayan Formation: 3D Tectonic Plate Collision</h2>
        <p className="text-sm mt-2">
          This 3D animation shows the Indian Plate colliding with the Eurasian Plate,
          leading to the formation of the Himalayas. Use your mouse or touch to rotate the view.
        </p>
      </div>
    </div>
  )
}

export default TectonicPlatesCollision

