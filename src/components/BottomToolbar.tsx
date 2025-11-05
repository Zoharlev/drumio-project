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
}: BottomToolbarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-around gap-6 max-w-4xl mx-auto">
          {/* Metronome Control */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMetronomeToggle}
              className={cn(
                "h-12 w-12 rounded-full transition-all duration-200",
                metronomeEnabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {metronomeEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
            <span className="text-xs text-muted-foreground font-medium">Metronome</span>
            <div className="w-full max-w-[100px]">
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
          <div className="flex flex-col items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onDrumSoundToggle}
              className={cn(
                "h-12 w-12 rounded-full transition-all duration-200",
                drumSoundEnabled
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Drum className="h-5 w-5" />
            </Button>
            <span className="text-xs text-muted-foreground font-medium">Drums</span>
            <div className="w-full max-w-[100px]">
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
            <div className="flex flex-col items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onAudioToggle}
                className={cn(
                  "h-12 w-12 rounded-full transition-all duration-200",
                  audioEnabled
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Music className="h-5 w-5" />
              </Button>
              <span className="text-xs text-muted-foreground font-medium">Audio</span>
              <div className="w-full max-w-[100px]">
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
    </div>
  );
};
