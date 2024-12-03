"use client"

import React, { useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Button } from "@/components/ui/button"

const TectonicPlatesSideView = () => {
  const [isPlaying, setIsPlaying] = useState(true)

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Himalayan Formation: Side View</h2>
      <div className="relative aspect-video bg-gradient-to-b from-sky-200 to-orange-100 overflow-hidden rounded-lg shadow-lg">
        <svg
          viewBox="0 0 1000 600"
          className={`w-full h-full ${isPlaying ? 'animate-plate-collision' : ''}`}
        >
          {/* Sky */}
          <rect x="0" y="0" width="1000" height="300" fill="url(#sky-gradient)" />
          
          {/* Ocean */}
          <rect x="0" y="300" width="1000" height="300" fill="url(#ocean-gradient)" />
          
          {/* Indian Plate */}
          <g className="indian-plate">
            <path d="M-100 600 L500 600 L500 350 Q400 300 300 350 L-100 350 Z" fill="#FFCC80" />
            <text x="100" y="500" fontSize="24" fill="#E65100">Indian Plate</text>
          </g>
          
          {/* Eurasian Plate */}
          <g className="eurasian-plate">
            <path d="M500 350 Q600 300 700 350 L1100 350 L1100 600 L500 600 Z" fill="#A5D6A7" />
            <text x="700" y="500" fontSize="24" fill="#1B5E20">Eurasian Plate</text>
          </g>
          
          {/* Himalayas */}
          <g className="himalayas">
            <path d="M480 350 Q500 200 520 350 Z" fill="#795548" />
            <text x="450" y="150" fontSize="20" fill="#4E342E">Himalayas</text>
          </g>
          
          {/* Subduction Zone */}
          <path d="M500 350 Q400 450 300 600" fill="none" stroke="#FF5722" strokeWidth="3" strokeDasharray="5,5" />
          <text x="350" y="550" fontSize="16" fill="#FF5722" transform="rotate(-45, 350, 550)">Subduction Zone</text>
          
          {/* Movement Arrows */}
          <g className="movement-arrows">
            <path d="M100 400 L150 400 M140 390 L150 400 L140 410" stroke="#E65100" strokeWidth="3" />
            <path d="M900 400 L850 400 M860 390 L850 400 L860 410" stroke="#1B5E20" strokeWidth="3" />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E3F2FD" />
              <stop offset="100%" stopColor="#BBDEFB" />
            </linearGradient>
            <linearGradient id="ocean-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B3E5FC" />
              <stop offset="100%" stopColor="#0288D1" />
            </linearGradient>
          </defs>
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
        This side view animation shows the Indian Plate subducting under the Eurasian Plate, 
        leading to the formation of the Himalayas. The process occurs over millions of years.
      </p>
    </div>
  )
}

export default TectonicPlatesSideView

