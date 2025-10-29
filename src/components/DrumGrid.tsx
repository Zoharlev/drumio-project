import { Button } from "@/components/ui/button";
import { Trash2, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DrumPattern, PatternComplexity } from "@/types/drumPatterns";

interface DrumGridProps {
  pattern: DrumPattern;
  currentStep: number;
  onStepToggle: (drum: string, step: number) => void;
  onClearPattern: () => void;
  metronomeEnabled: boolean;
  onMetronomeToggle: () => void;
  complexity: PatternComplexity;
}

const drumLabels: { [key: string]: { name: string; symbol: string } } = {
  kick: { name: "Kick", symbol: "●" },
  snare: { name: "Snare", symbol: "×" },
  hihat: { name: "Hi-Hat", symbol: "○" },
  openhat: { name: "Open Hat", symbol: "◎" },
  tom: { name: "Tom", symbol: "◆" },
  "HH Closed": { name: "Hi-Hat", symbol: "○" },
  "HH Open": { name: "Open Hat", symbol: "◎" },
  Kick: { name: "Kick", symbol: "●" },
  Snare: { name: "Snare", symbol: "×" },
  Tom: { name: "Tom", symbol: "◆" }
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
  const stepsPerView = 16;
  const [currentView, setCurrentView] = useState(0);
  
  const stepsToShow = complexity.maxSteps;
  const totalViews = Math.ceil(stepsToShow / stepsPerView);
  const startStep = currentView * stepsPerView;
  const endStep = Math.min(startStep + stepsPerView, stepsToShow);
  const visibleSteps = endStep - startStep;

  const handlePrevView = () => {
    setCurrentView(prev => Math.max(0, prev - 1));
  };

  const handleNextView = () => {
    setCurrentView(prev => Math.min(totalViews - 1, prev + 1));
  };

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
          
          {totalViews > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevView}
                disabled={currentView === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentView + 1} / {totalViews}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextView}
                disabled={currentView === totalViews - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
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
      <div className="relative bg-card rounded-lg p-6 border shadow-lg">
        {/* Playhead */}
        {currentStep >= startStep && currentStep < endStep && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary transition-all duration-75 z-10"
            style={{
              left: `${88 + ((currentStep - startStep) * (100 - 88 / visibleSteps)) / visibleSteps}%`,
              boxShadow: "0 0 20px hsl(var(--primary) / 0.6)",
            }}
          />
        )}

        {/* Beat Numbers */}
        <div className="flex mb-4 flex-col gap-1">
          <div className="flex">
            <div className="w-20 text-xs text-muted-foreground/50">Step#</div>
            {Array.from({ length: visibleSteps }, (_, i) => {
              const stepIndex = startStep + i;
              return (
                <div key={`step-${stepIndex}`} className="flex-1 text-center text-[10px] font-mono text-muted-foreground/40">
                  {stepIndex}
                </div>
              );
            })}
          </div>
          
          <div className="flex">
            <div className="w-20 text-xs text-muted-foreground/50">Count</div>
            {Array.from({ length: visibleSteps }, (_, i) => {
              const stepIndex = startStep + i;
              const posInBar = stepIndex % 16;
              const beatPosition = posInBar % 4;
              
              let displayText = '';
              let textStyle = "text-muted-foreground/60";
              
              if (beatPosition === 0) {
                displayText = String(Math.floor(posInBar / 4) + 1);
                textStyle = "text-primary font-bold";
              } else if (beatPosition === 1) {
                displayText = "e";
                textStyle = "text-muted-foreground/70 font-medium";
              } else if (beatPosition === 2) {
                displayText = "&";
                textStyle = "text-accent font-medium";
              } else if (beatPosition === 3) {
                displayText = "a";
                textStyle = "text-muted-foreground/70 font-medium";
              }
              
              return (
                <div key={stepIndex} className={cn("flex-1 text-center text-sm font-mono", textStyle)}>
                  {displayText}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drum Rows */}
        {Object.entries(pattern)
          .filter(([key]) => key !== 'length' && key !== 'subdivisions' && key !== 'offsets' && key !== 'sections')
          .filter(([_, steps]) => Array.isArray(steps))
          .map(([drumKey, steps]) => {
            const drumInfo = drumLabels[drumKey] || {
              name: drumKey,
              symbol: drumKey === 'Kick' ? '●' : drumKey === 'Snare' ? '×' : drumKey === 'Hi-Hat' ? '○' : drumKey === 'Tom' ? '◆' : '●'
            };
            
            return (
              <div key={drumKey} className="flex items-center mb-3 group">
                {/* Drum Label */}
                <div className="w-20 flex items-center gap-2 pr-4">
                  <span className="text-lg font-mono text-primary">{drumInfo.symbol}</span>
                  <span className="text-sm font-medium text-foreground">{drumInfo.name}</span>
                </div>

                {/* Grid Line */}
                <div className="flex-1 relative">
                  <div className="absolute inset-0 border-t border-border"></div>

                  {/* Step Buttons */}
                  <div className="flex relative z-10">
                    {Array.from({ length: visibleSteps }, (_, i) => {
                      const stepIndex = startStep + i;
                      const note = steps[stepIndex];
                      const isActive = note?.active || note === true;
                      const velocity = note?.velocity || 0.7;
                      const isOpen = (note as any)?.open;
                      const noteType = note?.type || 'normal';
                      const isCurrentStep = stepIndex === currentStep;
                      const isMainBeat = stepIndex % 2 === 0;
                      
                      return (
                        <button
                          key={stepIndex}
                          onClick={() => onStepToggle(drumKey, stepIndex)}
                          className={cn(
                            "flex-1 h-12 border-r border-border last:border-r-0 transition-all duration-200",
                            "flex items-center justify-center group-hover:bg-muted/20",
                            isCurrentStep && "bg-primary/10",
                            isMainBeat && "border-r-2 border-primary/30"
                          )}
                        >
                          {isActive && (
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80",
                                "shadow-lg transition-transform duration-200 hover:scale-110",
                                "flex items-center justify-center text-xs font-bold text-primary-foreground",
                                isCurrentStep && "animate-bounce",
                                noteType === 'ghost' && "w-4 h-4 bg-primary/40",
                                noteType === 'accent' && "w-7 h-7"
                              )}
                            >
                              {noteType === 'ghost' ? (
                                <div className="w-2 h-2 bg-current rounded-full opacity-60" />
                              ) : isOpen && (drumKey === 'hihat' || drumKey === 'openhat') ? (
                                <div className="w-3 h-3 border-2 border-current rounded-full" />
                              ) : (
                                drumInfo.symbol
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

        {/* Grid Enhancement */}
        <div className="absolute inset-6 pointer-events-none">
          {/* Vertical beat lines */}
          {Array.from({ length: Math.ceil(visibleSteps / 2) }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-primary/20"
              style={{ left: `${88 + (i * (100 - 88 / visibleSteps) / (visibleSteps / 2))}%` }}
            />
          ))}
        </div>
      </div>

      {/* Pattern Info */}
      <div className="text-center text-sm text-muted-foreground">
        Click on the grid to add or remove notes • Use arrows to navigate through the pattern
      </div>
    </div>
  );
};