import { motion } from "framer-motion";
import gridBg from "@assets/generated_images/retro_synthwave_grid_background.png";

export function BackgroundVideo() {
  return (
    <div className="absolute inset-0 z-0">
      {/* 
        INSTRUCTIONS FOR USER:
        To use a video background:
        1. Upload your video file (e.g., 'bg-loop.mp4') to the 'public' folder or 'attached_assets'
        2. Uncomment the <video> tag below
        3. Change 'src' to your video path
      */}
      
      {/* 
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
      >
        <source src="/bg-loop.mp4" type="video/mp4" />
      </video> 
      */}

      {/* Fallback Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${gridBg})`,
          opacity: 0.4,
          filter: 'hue-rotate(45deg) contrast(1.2)'
        }}
      />
      
      {/* CRT Scanlines Overlay - baked into background component for consistency */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-20 pointer-events-none" />
    </div>
  );
}
