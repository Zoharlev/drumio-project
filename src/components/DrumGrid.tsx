import { Button } from "@/components/ui/button";
import { Trash2, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrumGridProps {
  pattern: { [key: string]: any[] };
  currentStep: number;
  onStepToggle: (drum: string, step: number) => void;
  onClearPattern: () => void;
  metronomeEnabled: boolean;
  onMetronomeToggle: () => void;
  complexity: {
    hasEighthNotes: boolean;
    hasSixteenthNotes: boolean;
    hasVelocityVariation: boolean;
    hasOpenHats: boolean;
    maxSteps: number;
  };
}

const drumLabels: { [key: string]: { name: string; symbol: string } } = {
  kick: { name: "Kick", symbol: "●" },
  snare: { name: "Snare", symbol: "×" },
  hihat: { name: "Hi-Hat", symbol: "○" },
  openhat: { name: "Open Hat", symbol: "◎" },
};

export const DrumGrid = ({
  pattern,
  currentStep,
  onStepToggle,
  onClearPattern,
  metronomeEnabled,
  onMetronomeToggle,
  complexity
}: DrumGridProps) => {
  const stepsToShow = complexity.maxSteps;
  const beatsToShow = Math.ceil(stepsToShow / 4);
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={metronomeEnabled ? "default" : "outline"}
            onClick={onMetronomeToggle}
            className="flex items-center gap-2"
          >
            {metronomeEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            Metronome
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={onClearPattern}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Grid Container */}
      <div className="relative bg-card rounded-lg p-6 border">
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary transition-all duration-75 z-10"
          style={{
            left: `${88 + (currentStep * (100 - 88 / stepsToShow)) / stepsToShow}%`,
            boxShadow: "0 0 20px hsl(var(--primary) / 0.6)",
          }}
        />

        {/* Beat Numbers */}
        <div className="flex mb-4">
          <div className="w-20"></div>
          {Array.from({ length: stepsToShow }, (_, i) => {
            const beat = Math.floor(i / (stepsToShow / beatsToShow)) + 1;
            const subdivision = i % (stepsToShow / beatsToShow);
            const isMainBeat = subdivision === 0;
            
            let label = '';
            if (isMainBeat) {
              label = beat.toString();
            } else if (stepsToShow === 16 && subdivision === 2) {
              label = '&';
            } else if (stepsToShow === 32) {
              if (subdivision === 1) label = 'e';
              else if (subdivision === 2) label = '&';
              else if (subdivision === 3) label = 'a';
            }
            
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 text-center text-sm font-mono",
                  isMainBeat ? "text-primary font-bold" : "text-muted-foreground",
                  i === currentStep && "bg-primary/20 rounded"
                )}
              >
                {label}
              </div>
            );
          })}
        </div>

        {/* Drum Rows */}
        {Object.entries(drumLabels).map(([drumKey, { name, symbol }]) => (
          <div key={drumKey} className="flex items-center mb-3 group">
            {/* Drum Label */}
            <div className="w-20 flex items-center gap-2 pr-4">
              <span className="text-lg font-mono text-primary">{symbol}</span>
              <span className="text-sm font-medium text-foreground">{name}</span>
            </div>

            {/* Grid Line */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 border-t border-border"></div>

              {/* Step Buttons */}
              <div className="flex relative z-10">
                {pattern[drumKey]?.slice(0, stepsToShow).map((note, stepIndex) => {
                  const isActive = note?.active || note === true; // Handle both new and old format
                  const velocity = note?.velocity || 0.7;
                  const isOpen = (note as any)?.open;
                  const noteType = note?.type || 'normal';
                  const isCurrentStep = stepIndex === currentStep;
                  const isMainBeat = stepIndex % (stepsToShow / beatsToShow) === 0;
                  
                  let noteDisplay = null;
                  let buttonClass = "flex-1 h-12 border-r border-border last:border-r-0 transition-all duration-200 flex items-center justify-center group-hover:bg-muted/20";
                  
                  if (isCurrentStep) {
                    buttonClass += " bg-primary/10";
                  }
                  
                  if (isMainBeat) {
                    buttonClass += " border-r-2 border-primary/30";
                  }
                  
                  if (isActive) {
                    let noteClass = "w-6 h-6 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 flex items-center justify-center text-xs font-bold";
                    
                    if (noteType === 'ghost') {
                      noteClass += " bg-primary/40 text-primary-foreground/70";
                      noteDisplay = <div className="w-2 h-2 bg-current rounded-full opacity-60" />;
                    } else if (noteType === 'accent') {
                      noteClass += " bg-gradient-to-br from-primary to-primary/80 text-primary-foreground";
                      noteDisplay = <div className="w-4 h-4 bg-current rounded-full font-bold" />;
                    } else {
                      noteClass += " bg-gradient-to-br from-primary to-primary/80 text-primary-foreground";
                      noteDisplay = <div className="w-3 h-3 bg-current rounded-full" />;
                    }
                    
                    // Add open hat indicator
                    if (isOpen && (drumKey === 'hihat' || drumKey === 'openhat')) {
                      noteDisplay = (
                        <div className={`${noteType === 'ghost' ? 'w-2 h-2' : noteType === 'accent' ? 'w-4 h-4' : 'w-3 h-3'} border-2 border-current rounded-full`} />
                      );
                    }
                    
                    if (isCurrentStep && isActive) {
                      noteClass += " animate-bounce";
                    }
                    
                    noteDisplay = (
                      <div className={noteClass}>
                        {noteDisplay || symbol}
                      </div>
                    );
                  }
                  
                  return (
                    <button
                      key={stepIndex}
                      onClick={() => onStepToggle(drumKey, stepIndex)}
                      className={buttonClass}
                    >
                      {noteDisplay}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Grid Enhancement */}
        <div className="absolute inset-6 pointer-events-none">
          {/* Vertical beat lines */}
          {Array.from({ length: beatsToShow }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-primary/20"
              style={{ left: `${88 + (i * (100 - 88 / beatsToShow)) / beatsToShow}%` }}
            />
          ))}
        </div>
      </div>

      {/* Pattern Info */}
      <div className="text-center text-sm text-muted-foreground">
        Click on the grid to add or remove notes • Colored line shows current playback position
      </div>
    </div>
  );
};