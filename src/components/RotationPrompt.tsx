import { useIsMobile } from "@/hooks/use-mobile";
import { useIsLandscape } from "@/hooks/useIsLandscape";
import { RotateCcw } from "lucide-react";

export function RotationPrompt() {
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();

  // Only show on mobile when NOT in landscape
  if (!isMobile || isLandscape) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="animate-pulse">
        <RotateCcw className="h-16 w-16 text-primary animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <p className="mt-6 text-lg font-medium text-foreground">
        Please rotate your device
      </p>
      <p className="mt-2 text-sm text-muted-foreground text-center px-8">
        This experience works best in landscape mode
      </p>
    </div>
  );
}
