import { drumLogoImage } from "@/assets";

interface DrumLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  className?: string;
}

export default function DrumLogo({
  size = "md",
  showGlow = false,
  className = "",
}: DrumLogoProps) {
  const sizeConfig = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-24 h-24",
    xl: "w-48 h-48",
  };

  return (
    <div className={`relative ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 bg-gradient-to-r from-drumio-purple/20 to-drumio-purple/10 rounded-full blur-2xl scale-110"></div>
      )}
      
      <img 
        src={drumLogoImage} 
        alt="Drum Logo" 
        className={`${sizeConfig[size]} object-contain`}
      />
    </div>
  );
}