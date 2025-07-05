import { drumLogo } from "@/assets";
interface DrumLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  className?: string;
}
export default function DrumLogo({
  size = "md",
  showGlow = false,
  className = ""
}: DrumLogoProps) {
  const sizeConfig = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-48 h-48"
  };
  const sizeClass = sizeConfig[size];
  return <div className={`relative ${className}`}>
      {showGlow}
      
      <img src={drumLogo} alt="Drumio Logo" className={`${sizeClass} object-contain`} />
    </div>;
}