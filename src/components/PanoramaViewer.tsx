"use client";

import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import PanoramaUploader from "./PanoramaUploader";
import PanoramaScene, { Hotspot } from "./PanoramaScene";

export interface PanoramaImage {
  id: string;
  url: string;
  name: string;
  size: string;
}

export default function PanoramaViewer() {
  const [images, setImages] = useState<PanoramaImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  const [pendingHotspotPos, setPendingHotspotPos] = useState<[number, number, number] | null>(null);
  const [hotspotTitle, setHotspotTitle] = useState("");
  const [hotspotDesc, setHotspotDesc] = useState("");

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, []);

  const handleImageSelected = (url: string, name: string, size: string) => {
    const newImage = { id: Date.now().toString(), url, name, size };
    setImages(prev => [...prev, newImage]);
    setActiveImageId(newImage.id);
    setIsUploaderOpen(false);
  };

  const handleDownload = () => {
    const renderer = rendererRef.current;
    if (!renderer || !activeImage) {
      alert("Viewer is not fully loaded yet.");
      return;
    }

    try {
      const dataUrl = renderer.domElement.toDataURL("image/png");
      const link = document.createElement("a");
      const cleanName = activeImage.name 
        ? activeImage.name.substring(0, activeImage.name.lastIndexOf('.')) || activeImage.name
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

  const activeImage = images.find(img => img.id === activeImageId);
  const activeHotspots = hotspots.filter(h => h.imageId === activeImageId);

  const handleSceneClick = (point: [number, number, number]) => {
    if (isAddingHotspot) {
      setPendingHotspotPos(point);
      setIsAddingHotspot(false);
    }
  };

  const handleSaveHotspot = () => {
    if (pendingHotspotPos && activeImageId && hotspotTitle) {
      const newHotspot: Hotspot = {
        id: Date.now().toString(),
        imageId: activeImageId,
        position: pendingHotspotPos,
        title: hotspotTitle,
        description: hotspotDesc
      };
      setHotspots(prev => [...prev, newHotspot]);
      setPendingHotspotPos(null);
      setHotspotTitle("");
      setHotspotDesc("");
    }
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    setHotspots(prev => prev.filter(h => h.id !== hotspotId));
  };

  if (images.length === 0) {
    return (
      <main className="relative flex flex-col justify-between w-full min-h-screen bg-zinc-950 overflow-hidden select-none text-zinc-100">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

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
      </main>
    );
  }

  return (
    <main className="flex flex-col md:flex-row w-full h-[100dvh] bg-zinc-950 overflow-hidden select-none text-zinc-100 font-sans relative">
      {/* Sidebar */}
      <aside className="w-full md:w-80 h-1/3 md:h-full shrink-0 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex flex-col z-20">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Panoramas
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Select an environment to view</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {images.map(img => (
            <div 
              key={img.id}
              onClick={() => setActiveImageId(img.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                activeImageId === img.id 
                ? "border-cyan-500 bg-cyan-950/30" 
                : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-600"
              }`}
            >
              <h3 className="text-sm font-semibold truncate text-white">{img.name}</h3>
              <p className="text-xs text-zinc-500 mt-1">{img.size}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => setIsUploaderOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-black bg-zinc-100 hover:bg-white rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Add Panorama
          </button>
        </div>
      </aside>

      {/* Main View */}
      <div className="flex-1 relative">
        {activeImage && (
          <div className="absolute inset-0 z-0">
            <PanoramaScene 
              imageUrl={activeImage.url} 
              hotspots={activeHotspots}
              isAddingHotspot={isAddingHotspot}
              onCanvasReady={(gl) => { rendererRef.current = gl; }} 
              onSceneClick={handleSceneClick}
              onDeleteHotspot={handleDeleteHotspot}
            />
          </div>
        )}

        {/* HUD Top Bar Overlay */}
        <header className="absolute top-0 inset-x-0 z-10 p-4 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">
             <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase bg-zinc-950/80 px-3 py-1.5 rounded-full border border-zinc-800">
                {activeImage?.name}
             </span>
          </div>

          <div className="flex gap-3 pointer-events-auto">
            <button
              onClick={() => setIsAddingHotspot(!isAddingHotspot)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all duration-200 border ${
                isAddingHotspot 
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
                : "bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="hidden sm:inline">{isAddingHotspot ? "Click anywhere to add" : "Add Hotspot"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase bg-zinc-900/80 text-zinc-300 border border-zinc-700 hover:bg-zinc-800 hover:text-white rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span className="hidden sm:inline">Snapshot</span>
            </button>
          </div>
        </header>

        {/* Hotspot Form Modal */}
        {pendingHotspotPos && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Add Hotspot</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={hotspotTitle}
                    onChange={(e) => setHotspotTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="E.g., Living Room"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
                  <textarea 
                    value={hotspotDesc}
                    onChange={(e) => setHotspotDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 min-h-[80px] custom-scrollbar"
                    placeholder="Add some details..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setPendingHotspotPos(null)}
                  className="flex-1 py-2 text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveHotspot}
                  disabled={!hotspotTitle.trim()}
                  className="flex-1 py-2 text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  Save Hotspot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Uploader Modal */}
        {isUploaderOpen && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl">
              <button 
                onClick={() => setIsUploaderOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-zinc-300 bg-zinc-900/50 p-2 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <PanoramaUploader onImageSelected={handleImageSelected} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
