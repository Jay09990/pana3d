"use client";

import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import PanoramaUploader from "./PanoramaUploader";
import PanoramaScene from "./PanoramaScene";

export default function PanoramaViewer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Clean up Object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImageSelected = (url: string, name: string, size: string) => {
    setImageUrl(url);
    setFileDetails({ name, size });
  };

  const handleBack = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setFileDetails(null);
    rendererRef.current = null;
  };

  const handleDownload = () => {
    const renderer = rendererRef.current;
    if (!renderer) {
      alert("Viewer is not fully loaded yet.");
      return;
    }

    try {
      // Get the image data from WebGL context (requires preserveDrawingBuffer: true)
      const dataUrl = renderer.domElement.toDataURL("image/png");
      
      const link = document.createElement("a");
      const cleanName = fileDetails?.name 
        ? fileDetails.name.substring(0, fileDetails.name.lastIndexOf('.')) || fileDetails.name
        : "panorama";
      
      link.download = `${cleanName}-capture.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error capturing snapshot:", error);
      alert("Failed to capture snapshot. Make sure the scene is fully loaded.");
    }
  };

  return (
    <main className="relative flex flex-col justify-between w-full min-h-screen bg-zinc-950 overflow-hidden select-none text-zinc-100">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {!imageUrl ? (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
              360° PANORAMA STUDIO
            </h1>
            <p className="text-zinc-400 mt-2 text-base max-w-md mx-auto font-light">
              Experience immersive 360-degree environments inside a gorgeous 3D WebGL renderer.
            </p>
          </div>
          
          <PanoramaUploader onImageSelected={handleImageSelected} />
        </div>
      ) : (
        <div className="relative w-full h-screen">
          {/* 3D Canvas Scene */}
          <div className="absolute inset-0 z-0">
            <PanoramaScene 
              imageUrl={imageUrl} 
              onCanvasReady={(gl) => {
                rendererRef.current = gl;
              }} 
            />
          </div>

          {/* HUD Top Bar Overlay */}
          <header className="absolute top-0 inset-x-0 z-10 p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gradient-to-b from-zinc-950/80 to-transparent backdrop-blur-xs">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  ></path>
                </svg>
                Upload New
              </button>
              
              <div className="hidden sm:block h-6 w-px bg-zinc-800"></div>

              <div className="flex flex-col truncate">
                <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Active Environment</span>
                <span className="text-sm font-medium text-white truncate max-w-xs md:max-w-md">
                  {fileDetails?.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {fileDetails?.size && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 shadow-md">
                  {fileDetails.size}
                </span>
              )}
            </div>
          </header>

          {/* HUD Bottom Controls Overlay */}
          <footer className="absolute bottom-0 inset-x-0 z-10 p-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-gradient-to-t from-zinc-950/80 to-transparent backdrop-blur-xs">
            {/* Quick Tips */}
            <div className="flex items-center gap-3 text-xs text-zinc-400 bg-zinc-950/40 px-4 py-2 rounded-full border border-zinc-900/50 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Drag to look around</span>
              <span className="text-zinc-600">•</span>
              <span>Scroll to zoom</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2.5 px-6 py-3 text-xs uppercase font-bold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-95 hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Capture Snapshot
              </button>
            </div>
          </footer>
        </div>
      )}
    </main>
  );
}
