import { useIsMobile } from "@/hooks/use-mobile";
import { useIsLandscape } from "@/hooks/useIsLandscape";
import { Smartphone } from "lucide-react";

export function RotationPrompt() {
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();

  // Only show on mobile when NOT in landscape
  if (!isMobile || isLandscape) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Animated phone device */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Phone icon with rotation animation */}
        <div className="animate-device-rotate">
          <Smartphone className="h-16 w-16 text-primary" strokeWidth={1.5} />
        </div>
        
        {/* Circular arrow indicator */}
        <svg 
          className="absolute inset-0 w-24 h-24 animate-pulse" 
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M 75 50 A 25 25 0 1 1 50 25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-muted-foreground"
          />
          <polygon 
            points="50,18 45,28 55,28" 
            fill="currentColor"
            className="text-muted-foreground"
          />
        </svg>
      </div>
      
      <p className="mt-8 text-lg font-medium text-foreground">
        Rotate your device
      </p>
      <p className="mt-2 text-sm text-muted-foreground text-center px-8">
        For the best drumming experience, please use landscape mode
      </p>
    </div>
  );
}
