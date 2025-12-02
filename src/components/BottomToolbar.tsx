import { Button } from "@/components/ui/button";
import { Music, Drum, Grid3x3, Minus, Plus, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewMode } from "@/components/ViewToggle";

interface BottomToolbarProps {
  // View toggle
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  // Sound toggles
  metronomeEnabled: boolean;
  drumSoundEnabled: boolean;
  audioEnabled: boolean;
  onMetronomeToggle: () => void;
  onDrumSoundToggle: () => void;
  onAudioToggle: () => void;
  // Timer
  currentTime: number;
  totalTime: number;
  // BPM
  bpm: number;
  targetBpm: number;
  onBpmDecrease: () => void;
  onBpmIncrease: () => void;
  // Layout
  isLandscape?: boolean;
  showAudioControl?: boolean;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const BottomToolbar = ({
  viewMode,
  onViewModeChange,
  metronomeEnabled,
  drumSoundEnabled,
  audioEnabled,
  onMetronomeToggle,
  onDrumSoundToggle,
  onAudioToggle,
  currentTime,
  totalTime,
  bpm,
  targetBpm,
  onBpmDecrease,
  onBpmIncrease,
  isLandscape = false,
  showAudioControl = true,
}: BottomToolbarProps) => {
  const iconSize = isLandscape ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = isLandscape ? "h-8 w-8" : "h-10 w-10";

  return (
    <div
      className={cn(
        "backdrop-blur-sm border border-border flex items-center justify-between",
        isLandscape
          ? "h-[40px] px-3 rounded-xl"
          : "h-[55px] px-4 rounded-3xl"
      )}
      style={{ backgroundColor: "rgba(31, 39, 51, 0.4)" }}
    >
      {/* Left Side: View Toggle + Sound Controls */}
      <div className="flex items-center gap-2">
        {/* Notation View Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewModeChange('notation')}
          className={cn(
            "rounded-full transition-all duration-200",
            buttonSize,
            viewMode === 'notation'
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Music className={iconSize} />
        </Button>

        {/* Grid View Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewModeChange('grid')}
          className={cn(
            "rounded-full transition-all duration-200",
            buttonSize,
            viewMode === 'grid'
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Grid3x3 className={iconSize} />
        </Button>

        {/* Vertical Separator */}
        <div className={cn(
          "w-px bg-muted-foreground/30 mx-1",
          isLandscape ? "h-5" : "h-6"
        )} />

        {/* Drum Sound Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDrumSoundToggle}
          className={cn(
            "rounded-full transition-all duration-200",
            buttonSize,
            drumSoundEnabled
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Drum className={iconSize} />
        </Button>

        {/* Metronome Sound Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMetronomeToggle}
          className={cn(
            "rounded-full transition-all duration-200",
            buttonSize,
            metronomeEnabled
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Volume2 className={iconSize} />
        </Button>

        {/* Music Sound Toggle */}
        {showAudioControl && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAudioToggle}
            className={cn(
              "rounded-full transition-all duration-200",
              buttonSize,
              audioEnabled
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <svg
              className={iconSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </Button>
        )}
      </div>

      {/* Right Side: Timer + BPM Controller */}
      <div className="flex items-center gap-4">
        {/* Timer Display */}
        <div className={cn(
          "font-mono text-foreground",
          isLandscape ? "text-sm" : "text-base"
        )}>
          <span className="font-bold">{formatTime(currentTime)}</span>
          <span className="text-muted-foreground">/{formatTime(totalTime)}</span>
        </div>

        {/* BPM Controller */}
        <div className={cn(
          "flex items-center bg-background/80 rounded-lg",
          isLandscape ? "h-7 px-1" : "h-9 px-2"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBpmDecrease}
            disabled={bpm <= 60}
            className={cn(
              "rounded text-foreground hover:bg-muted/50",
              isLandscape ? "h-5 w-5" : "h-6 w-6"
            )}
          >
            <Minus className={isLandscape ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <span className={cn(
            "font-bold text-foreground min-w-[50px] text-center",
            isLandscape ? "text-xs" : "text-sm"
          )}>
            {bpm}<span className="text-muted-foreground">/{targetBpm}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBpmIncrease}
            disabled={bpm >= targetBpm}
            className={cn(
              "rounded text-foreground hover:bg-muted/50",
              isLandscape ? "h-5 w-5" : "h-6 w-6"
            )}
          >
            <Plus className={isLandscape ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>
      </div>
    </div>
  );
};
