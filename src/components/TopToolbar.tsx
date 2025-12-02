import { Play, Pause, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopToolbarProps {
  title: string;
  currentSection?: string;
  isPlaying: boolean;
  isLandscape: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const TopToolbar = ({
  title,
  currentSection,
  isPlaying,
  isLandscape,
  onPlayPause,
  onRestart,
  onExit,
}: TopToolbarProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between bg-card border border-border backdrop-blur-sm relative",
        isLandscape
          ? "h-[40px] px-3 rounded-xl"
          : "h-[55px] px-6 rounded-3xl"
      )}
    >
      {/* Left: Song/Practice Name */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "font-medium text-foreground truncate block",
            isLandscape ? "text-sm" : "text-base"
          )}
        >
          {title}
        </span>
      </div>

      {/* Center: Current Section Pill */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <div
          className={cn(
            "bg-primary text-primary-foreground font-medium rounded-full flex items-center justify-center text-center",
            isLandscape
              ? "px-4 py-1 text-xs min-w-[80px]"
              : "px-6 py-2 text-sm min-w-[100px]"
          )}
        >
          {currentSection || "Section"}
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <Button
          size="icon"
          variant="secondary"
          onClick={onPlayPause}
          className={cn(
            "rounded-full bg-muted/60 hover:bg-muted/80 text-muted-foreground",
            isLandscape ? "h-7 w-7" : "h-10 w-10"
          )}
        >
          {isPlaying ? (
            <Pause
              className={cn(isLandscape ? "h-3.5 w-3.5" : "h-5 w-5")}
              fill="currentColor"
            />
          ) : (
            <Play
              className={cn(isLandscape ? "h-3.5 w-3.5" : "h-5 w-5")}
              fill="currentColor"
            />
          )}
        </Button>

        {/* Restart Button */}
        <Button
          size="icon"
          variant="secondary"
          onClick={onRestart}
          className={cn(
            "rounded-full bg-muted hover:bg-muted/80",
            isLandscape ? "h-7 w-7" : "h-10 w-10"
          )}
        >
          <RotateCcw className={cn(isLandscape ? "h-3.5 w-3.5" : "h-5 w-5")} />
        </Button>

        {/* Exit/Close Button */}
        <Button
          size="icon"
          variant="secondary"
          onClick={onExit}
          className={cn(
            "rounded-full bg-muted hover:bg-muted/80",
            isLandscape ? "h-7 w-7" : "h-10 w-10"
          )}
        >
          <X className={cn(isLandscape ? "h-3.5 w-3.5" : "h-5 w-5")} />
        </Button>
      </div>
    </div>
  );
};
