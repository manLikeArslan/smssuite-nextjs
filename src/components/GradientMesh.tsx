"use client";

import React from 'react';

export function GradientMesh() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full animate-mesh-1" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-navy/5 blur-[120px] rounded-full animate-mesh-2" />
            <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-accent/10 blur-[100px] rounded-full animate-mesh-3" />

            <style jsx global>{`
        @keyframes mesh-1 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10%, 10%) scale(1.1); }
          66% { transform: translate(-5%, 15%) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes mesh-2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15%, -10%) scale(1.2); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes mesh-3 {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(10%, -20%) rotate(45deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-mesh-1 { animation: mesh-1 20s infinite ease-in-out; }
        .animate-mesh-2 { animation: mesh-2 25s infinite ease-in-out; }
        .animate-mesh-3 { animation: mesh-3 30s infinite ease-in-out; }
      `}</style>
        </div>
    );
}
