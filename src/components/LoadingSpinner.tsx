import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin"></div>
        {/* Inner ring spinning backwards */}
        <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-pink-500 border-b-transparent border-l-cyan-400 animate-spin [animation-direction:reverse] [animation-duration:1s]"></div>
      </div>
      <div className="text-zinc-400 text-sm font-medium tracking-wider animate-pulse uppercase">
        Loading 3D Texture...
      </div>
    </div>
  );
}
