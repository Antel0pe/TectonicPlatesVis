"use client"

import React, { useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Button } from "@/components/ui/button"

const TectonicPlatesAnimation = () => {
  const [isPlaying, setIsPlaying] = useState(true)

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Himalayan Formation: Tectonic Plate Collision</h2>
      <div className="relative aspect-video bg-blue-100 overflow-hidden rounded-lg shadow-lg">
        <svg
          viewBox="0 0 1000 600"
          className={`w-full h-full ${isPlaying ? 'animate-plate-movement' : ''}`}
        >
          {/* Ocean */}
          <rect x="0" y="0" width="1000" height="600" fill="#E3F2FD" />
          
          {/* Eurasian Plate */}
          <g className="eurasian-plate">
            <path d="M0 0 L1000 0 L1000 300 Q500 350 0 300 Z" fill="#A5D6A7" />
            <text x="450" y="100" fontSize="24" fill="#1B5E20">Eurasian Plate</text>
            <path d="M500 320 L450 270 L550 270 Z" fill="#1B5E20" />
          </g>
          
          {/* Indian Plate */}
          <g className="indian-plate">
            <path d="M0 600 L1000 600 L1000 350 Q500 300 0 350 Z" fill="#FFCC80" />
            <text x="450" y="500" fontSize="24" fill="#E65100">Indian Plate</text>
            <path d="M500 330 L450 380 L550 380 Z" fill="#E65100" />
          </g>
          
          {/* Himalayas */}
          <g className="himalayas">
            <path d="M400 300 Q500 250 600 300 Q500 320 400 300 Z" fill="#795548" />
            <text x="460" y="280" fontSize="20" fill="white">Himalayas</text>
          </g>
          
          {/* Movement Arrows */}
          <g className="movement-arrows">
            <path d="M100 150 L150 150 M140 140 L150 150 L140 160" stroke="#1B5E20" strokeWidth="3" />
            <path d="M100 450 L150 450 M140 440 L150 450 L140 460" stroke="#E65100" strokeWidth="3" />
          </g>
        </svg>
        
        {/* Play/Pause Button */}
        <Button
          className="absolute bottom-4 right-4"
          onClick={toggleAnimation}
          variant="outline"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
      <p className="mt-4 text-center text-sm text-gray-600">
        This animation shows the collision of the Indian and Eurasian tectonic plates, 
        which results in the formation of the Himalayas.
      </p>
    </div>
  )
}

export default TectonicPlatesAnimation

