"use client";

import React, { useState, useRef } from "react";

interface PanoramaUploaderProps {
  onImageSelected: (url: string, fileName: string, fileSize: string) => void;
}

export default function PanoramaUploader({ onImageSelected }: PanoramaUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      const name = file.name;
      const size = formatBytes(file.size);
      onImageSelected(url, name, size);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4">
      {/* Glow Effect Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative z-10 w-full max-w-xl p-10 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group backdrop-blur-md bg-zinc-900/60 ${
          isDragActive
            ? "border-cyan-400 bg-zinc-900/80 shadow-[0_0_30px_rgba(34,211,238,0.15)] scale-[1.02]"
            : "border-zinc-700 hover:border-indigo-500 hover:bg-zinc-900/70 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileInput}
        />

        {/* Upload Icon */}
        <div className={`p-5 rounded-full mb-6 transition-all duration-300 ${
          isDragActive 
            ? "bg-cyan-500/10 text-cyan-400" 
            : "bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
        }`}>
          <svg
            className="w-10 h-10 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            ></path>
          </svg>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Upload 360° Panorama
        </h2>
        <p className="text-zinc-400 mb-6 max-w-sm text-sm">
          Drag and drop your equirectangular panoramic image here, or click to browse your files.
        </p>

        {/* File recommendations badge */}
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-800">
            JPG / PNG
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-800">
            Equirectangular
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-800">
            360° Field
          </span>
        </div>
      </div>
    </div>
  );
}
