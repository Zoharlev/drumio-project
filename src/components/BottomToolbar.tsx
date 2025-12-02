import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Music, Drum } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomToolbarProps {
  metronomeEnabled: boolean;
  drumSoundEnabled: boolean;
  audioEnabled: boolean;
  onMetronomeToggle: () => void;
  onDrumSoundToggle: () => void;
  onAudioToggle: () => void;
  metronomeVolume: number;
  drumVolume: number;
  audioVolume: number;
  onMetronomeVolumeChange: (volume: number) => void;
  onDrumVolumeChange: (volume: number) => void;
  onAudioVolumeChange: (volume: number) => void;
  showAudioControl?: boolean;
  isLandscape?: boolean;
}

export const BottomToolbar = ({
  metronomeEnabled,
  drumSoundEnabled,
  audioEnabled,
  onMetronomeToggle,
  onDrumSoundToggle,
  onAudioToggle,
  metronomeVolume,
  drumVolume,
  audioVolume,
  onMetronomeVolumeChange,
  onDrumVolumeChange,
  onAudioVolumeChange,
  showAudioControl = true,
  isLandscape = false,
}: BottomToolbarProps) => {
  return (
    <div className={cn(
      "bg-card/95 backdrop-blur-sm border border-border rounded-3xl",
      isLandscape ? "h-[40px] px-3 rounded-xl" : "h-[55px] px-6"
    )}>
      <div className={cn(
        "flex items-center justify-around gap-4 h-full",
        isLandscape ? "max-w-none" : "max-w-4xl mx-auto"
      )}>
        {/* Metronome Control */}
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMetronomeToggle}
            className={cn(
              "rounded-full transition-all duration-200",
              isLandscape ? "h-7 w-7" : "h-10 w-10",
              metronomeEnabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {metronomeEnabled ? (
              <Volume2 className={cn(isLandscape ? "h-3.5 w-3.5" : "h-4 w-4")} />
            ) : (
              <VolumeX className={cn(isLandscape ? "h-3.5 w-3.5" : "h-4 w-4")} />
            )}
          </Button>
          {!isLandscape && (
            <span className="text-xs text-muted-foreground font-medium hidden sm:block">Metro</span>
          )}
          <div className={cn(
            "flex-1",
            isLandscape ? "max-w-[60px]" : "max-w-[80px]"
          )}>
            <Slider
              value={[metronomeVolume * 100]}
              onValueChange={([value]) => onMetronomeVolumeChange(value / 100)}
              max={100}
              step={1}
              className="w-full"
              disabled={!metronomeEnabled}
            />
          </div>
        </div>

        {/* Drum Sound Control */}
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDrumSoundToggle}
            className={cn(
              "rounded-full transition-all duration-200",
              isLandscape ? "h-7 w-7" : "h-10 w-10",
              drumSoundEnabled
                ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Drum className={cn(isLandscape ? "h-3.5 w-3.5" : "h-4 w-4")} />
          </Button>
          {!isLandscape && (
            <span className="text-xs text-muted-foreground font-medium hidden sm:block">Drums</span>
          )}
          <div className={cn(
            "flex-1",
            isLandscape ? "max-w-[60px]" : "max-w-[80px]"
          )}>
            <Slider
              value={[drumVolume * 100]}
              onValueChange={([value]) => onDrumVolumeChange(value / 100)}
              max={100}
              step={1}
              className="w-full"
              disabled={!drumSoundEnabled}
            />
          </div>
        </div>

        {/* Audio Playback Control */}
        {showAudioControl && (
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onAudioToggle}
              className={cn(
                "rounded-full transition-all duration-200",
                isLandscape ? "h-7 w-7" : "h-10 w-10",
                audioEnabled
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Music className={cn(isLandscape ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </Button>
            {!isLandscape && (
              <span className="text-xs text-muted-foreground font-medium hidden sm:block">Audio</span>
            )}
            <div className={cn(
              "flex-1",
              isLandscape ? "max-w-[60px]" : "max-w-[80px]"
            )}>
              <Slider
                value={[audioVolume * 100]}
                onValueChange={([value]) => onAudioVolumeChange(value / 100)}
                max={100}
                step={1}
                className="w-full"
                disabled={!audioEnabled}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
