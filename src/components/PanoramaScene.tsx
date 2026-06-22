"use client";

import React, { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import LoadingSpinner from "./LoadingSpinner";

interface PanoramaSceneProps {
  imageUrl: string;
  onCanvasReady: (gl: THREE.WebGLRenderer) => void;
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
function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  
  // Set texture parameters for optimal quality
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return (
    <Sphere args={[500, 60, 40]} scale={[-1, 1, 1]}>
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </Sphere>
  );
}

export default function PanoramaScene({ imageUrl, onCanvasReady }: PanoramaSceneProps) {
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
          <PanoramaSphere imageUrl={imageUrl} />
        </Suspense>

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
