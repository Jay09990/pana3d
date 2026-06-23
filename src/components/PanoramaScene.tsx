"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import LoadingSpinner from "./LoadingSpinner";

export interface Hotspot {
  id: string;
  imageId: string;
  position: [number, number, number];
  title: string;
  description: string;
}

interface PanoramaSceneProps {
  imageUrl: string;
  hotspots: Hotspot[];
  isAddingHotspot: boolean;
  onCanvasReady: (gl: THREE.WebGLRenderer) => void;
  onSceneClick: (point: [number, number, number]) => void;
  onDeleteHotspot: (id: string) => void;
}

// Inner component to access R3F context and extract the renderer
function CanvasReporter({ onCanvasReady }: { onCanvasReady: (gl: THREE.WebGLRenderer) => void }) {
  const { gl } = useThree();
  
  useEffect(() => {
    if (gl) {
      onCanvasReady(gl);
    }
  }, [gl, onCanvasReady]);

  return null;
}

// Inner component that loads the texture and renders the sphere
function PanoramaSphere({ 
  imageUrl, 
  isAddingHotspot,
  onSceneClick 
}: { 
  imageUrl: string, 
  isAddingHotspot: boolean,
  onSceneClick: (point: [number, number, number]) => void 
}) {
  const texture = useTexture(imageUrl);
  
  // Set texture parameters for optimal quality
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const handleClick = (e: any) => {
    if (isAddingHotspot) {
      e.stopPropagation();
      onSceneClick([e.point.x, e.point.y, e.point.z]);
    }
  };

  return (
    <Sphere 
      args={[500, 60, 40]} 
      scale={[-1, 1, 1]} 
      onClick={handleClick}
      onPointerOver={(e) => {
        if (isAddingHotspot) document.body.style.cursor = 'crosshair';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </Sphere>
  );
}

// Render individual hotspots
function HotspotMarkers({ hotspots, onDeleteHotspot }: { hotspots: Hotspot[], onDeleteHotspot: (id: string) => void }) {
  const [openHotspotId, setOpenHotspotId] = useState<string | null>(null);

  return (
    <>
      {hotspots.map((hotspot) => (
        <Html 
          key={hotspot.id} 
          position={hotspot.position} 
          center 
          zIndexRange={[100, 0]}
        >
          <div className="relative group">
            {/* Hotspot Icon */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setOpenHotspotId(openHotspotId === hotspot.id ? null : hotspot.id);
              }}
              className="w-8 h-8 flex items-center justify-center bg-cyan-500/80 hover:bg-cyan-400 text-white rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300 border-2 border-white/50 backdrop-blur-sm cursor-pointer"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>
              <div className="w-2.5 h-2.5 bg-white rounded-full relative z-10"></div>
            </button>

            {/* Hotspot Info Card */}
            {(openHotspotId === hotspot.id) && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 p-3 rounded-lg shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-white text-sm font-bold truncate">{hotspot.title}</h4>
                  <button onClick={() => setOpenHotspotId(null)} className="text-zinc-400 hover:text-white">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <p className="text-zinc-300 text-xs mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                  {hotspot.description}
                </p>
                <div className="mt-2 pt-2 border-t border-zinc-700/50 flex justify-end">
                  <button 
                    onClick={() => {
                      onDeleteHotspot(hotspot.id);
                      setOpenHotspotId(null);
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 uppercase font-bold tracking-wider transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </Html>
      ))}
    </>
  );
}

export default function PanoramaScene({ 
  imageUrl, 
  hotspots,
  isAddingHotspot,
  onCanvasReady,
  onSceneClick,
  onDeleteHotspot
}: PanoramaSceneProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          powerPreference: "high-performance"
        }}
        camera={{ fov: 75, position: [0, 0, 0.1] }}
        className="w-full h-full"
      >
        <Suspense fallback={<Html center><LoadingSpinner /></Html>}>
          <PanoramaSphere 
            imageUrl={imageUrl} 
            isAddingHotspot={isAddingHotspot}
            onSceneClick={onSceneClick}
          />
        </Suspense>

        <HotspotMarkers hotspots={hotspots} onDeleteHotspot={onDeleteHotspot} />

        <CanvasReporter onCanvasReady={onCanvasReady} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={false}
          rotateSpeed={-0.3}
          minDistance={0.1}
          maxDistance={0.1}
        />
      </Canvas>
    </div>
  );
}
