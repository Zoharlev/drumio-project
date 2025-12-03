import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { DrumPattern, PatternComplexity } from "@/types/drumPatterns";
interface DrumGridProps {
  pattern: DrumPattern;
  currentStep: number;
  scrollOffset: number;
  onStepToggle?: (drum: string, step: number) => void;
  onClearPattern?: () => void;
  metronomeEnabled?: boolean;
  onMetronomeToggle?: () => void;
  onTogglePlay?: () => void;
  isPlaying?: boolean;
  complexity: PatternComplexity;
  isLandscape?: boolean;
}
const drumLabels: {
  [key: string]: {
    name: string;
    symbol: string;
  };
} = {
  kick: {
    name: "Kick",
    symbol: "●"
  },
  snare: {
    name: "Snare",
    symbol: "×"
  },
  ghostsnare: {
    name: "Ghost",
    symbol: "⊗"
  },
  hihat: {
    name: "HH",
    symbol: "○"
  },
  openhat: {
    name: "Open",
    symbol: "◎"
  },
  tom: {
    name: "Tom",
    symbol: "◆"
  },
  lowtom: {
    name: "LTom",
    symbol: "◇"
  },
  crash: {
    name: "Crash",
    symbol: "☆"
  },
  ride: {
    name: "Ride",
    symbol: "◉"
  },
  "HH Closed": {
    name: "HH",
    symbol: "○"
  },
  "HH Open": {
    name: "Open",
    symbol: "◎"
  },
  Kick: {
    name: "Kick",
    symbol: "●"
  },
  Snare: {
    name: "Snare",
    symbol: "×"
  },
  Tom: {
    name: "Tom",
    symbol: "◆"
  }
};

// Memoized step button for performance
const StepButton = memo(({
  stepIndex,
  note,
  drumKey,
  drumInfo,
  isCurrentStep,
  isMainBeat,
  onToggle,
  isLandscape,
  isEditable
}: {
  stepIndex: number;
  note: any;
  drumKey: string;
  drumInfo: {
    name: string;
    symbol: string;
  };
  isCurrentStep: boolean;
  isMainBeat: boolean;
  onToggle?: () => void;
  isLandscape: boolean;
  isEditable: boolean;
}) => {
  const isActive = note?.active || note === true;
  const noteType = note?.type || 'normal';
  const isOpen = (note as any)?.open;
  return <button 
    onClick={isEditable ? onToggle : undefined} 
    disabled={!isEditable}
    className={cn(
      "flex-1 border-r border-grid-line last:border-r-0 transition-all duration-200", 
      "flex items-center justify-center",
      isEditable && "group-hover:bg-muted/20 cursor-pointer",
      !isEditable && "cursor-default",
      isCurrentStep && "bg-playhead/10", 
      isMainBeat && "border-r-2 border-primary/30", 
      isLandscape ? "h-full min-w-[24px]" : "h-12"
    )}>
      {isActive && <div className={cn("rounded-full transition-transform duration-200", isEditable && "hover:scale-110", "flex items-center justify-center font-bold", isCurrentStep && isActive && "animate-bounce", isLandscape ? "w-2 h-2 text-[6px]" : "w-6 h-6 text-xs", noteType === 'ghost' && "border-2 border-note-active/50 bg-transparent text-note-active/50", noteType === 'ghost' && (isLandscape ? "w-2 h-2" : "w-5 h-5"), noteType === 'normal' && "bg-gradient-to-br from-note-active to-accent shadow-note text-background", noteType === 'accent' && "bg-gradient-to-br from-note-active to-accent shadow-note text-background", noteType === 'accent' && (isLandscape ? "w-3 h-3" : "w-7 h-7"))}>
          {!isLandscape && (noteType === 'ghost' ? <span className="text-[10px]">{drumInfo.symbol}</span> : isOpen && (drumKey === 'hihat' || drumKey === 'openhat') ? <div className="w-3 h-3 border-2 border-current rounded-full" /> : drumInfo.symbol)}
        </div>}
    </button>;
});
StepButton.displayName = 'StepButton';

// Memoized drum row
const DrumRow = memo(({
  drumKey,
  steps,
  drumInfo,
  visibleSteps,
  startStep,
  currentStep,
  onStepToggle,
  isLandscape,
  isEditable
}: {
  drumKey: string;
  steps: any[];
  drumInfo: {
    name: string;
    symbol: string;
  };
  visibleSteps: number;
  startStep: number;
  currentStep: number;
  onStepToggle?: (drum: string, step: number) => void;
  isLandscape: boolean;
  isEditable: boolean;
}) => {
  return <div className={cn("flex items-center group", isLandscape ? "mb-0 flex-1" : "mb-3")}>
      {/* Drum Label */}
      <div className={cn("flex items-center gap-1 pr-2", isLandscape ? "w-12" : "w-20 gap-2 pr-4")}>
        <span className={cn("font-mono text-accent", isLandscape ? "text-xs" : "text-lg")}>{drumInfo.symbol}</span>
        <span className={cn("font-medium text-foreground truncate", isLandscape ? "text-[8px]" : "text-sm")}>{drumInfo.name}</span>
      </div>

      {/* Grid Line */}
      <div className="flex-1 relative h-full">
        <div className="absolute inset-0 border-t border-grid-line"></div>

        {/* Step Buttons */}
        <div className="flex relative z-10 h-full">
          {Array.from({
          length: visibleSteps
        }, (_, i) => {
          const stepIndex = startStep + i;
          const note = steps[stepIndex];
          const isCurrentStepActive = stepIndex === currentStep;
          const isMainBeat = stepIndex % 2 === 0;
          return <StepButton key={stepIndex} stepIndex={stepIndex} note={note} drumKey={drumKey} drumInfo={drumInfo} isCurrentStep={isCurrentStepActive} isMainBeat={isMainBeat} onToggle={onStepToggle ? () => onStepToggle(drumKey, stepIndex) : undefined} isLandscape={isLandscape} isEditable={isEditable} />;
        })}
        </div>
      </div>
    </div>;
});
DrumRow.displayName = 'DrumRow';
export const DrumGrid = memo(({
  pattern,
  currentStep,
  scrollOffset,
  onStepToggle,
  onClearPattern,
  metronomeEnabled,
  onMetronomeToggle,
  onTogglePlay,
  isPlaying,
  complexity,
  isLandscape = false
}: DrumGridProps) => {
  const visibleStepsCount = 20;
  const maxStart = Math.max(0, complexity.maxSteps - visibleStepsCount);
  const startStep = Math.min(Math.max(0, scrollOffset), maxStart);
  const endStep = Math.min(startStep + visibleStepsCount, complexity.maxSteps);
  const visibleSteps = endStep - startStep;
  const playheadIndex = Math.min(Math.max(currentStep - startStep, 0), Math.max(visibleSteps - 1, 0));
  const drumRows = Object.entries(pattern).filter(([key]) => key !== 'length' && key !== 'subdivisions' && key !== 'offsets' && key !== 'sections').filter(([_, steps]) => Array.isArray(steps)).filter(([drumKey, steps]) => {
    const basicInstruments = ['kick', 'snare', 'hihat', 'openhat'];
    if (basicInstruments.includes(drumKey)) return true;
    return Array.isArray(steps) && steps.some(note => note?.active === true);
  }).sort(([keyA], [keyB]) => {
    const order = ['hihat', 'openhat', 'snare', 'ghostsnare', 'crash', 'ride', 'tom', 'lowtom', 'kick'];
    const indexA = order.indexOf(keyA);
    const indexB = order.indexOf(keyB);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
  return <div className={cn(isLandscape ? "h-full flex flex-col space-y-0" : "space-y-6")}>
      {/* Controls - hidden in landscape */}
      {!isLandscape}

      {/* Grid Container */}
      <div className={cn("relative bg-card rounded-lg shadow-elevated transition-opacity duration-300", isLandscape ? "flex-1 p-2 flex flex-col" : "p-6")}>
        {/* Playhead - Fixed position */}
        <div className="absolute top-0 bottom-0 w-1 bg-playhead z-20 pointer-events-none" style={{
        left: `calc(${isLandscape ? '3rem' : '5rem'} + ${isLandscape ? '0.5rem' : '1.5rem'} + ((100% - ${isLandscape ? '3rem' : '5rem'} - ${isLandscape ? '1rem' : '3rem'}) * ${visibleSteps > 0 ? playheadIndex / visibleSteps : 0}))`,
        boxShadow: "0 0 20px hsl(var(--playhead) / 0.6)",
        transition: "left 75ms ease-out"
      }} />

        {/* Beat Numbers - Compact in landscape */}
        {!isLandscape && <div className="flex mb-4 flex-col gap-2 pb-2 border-b-2 border-primary/10">
            <div className="flex">
              <div className="w-20 text-xs font-semibold text-primary/70">Step#</div>
              {Array.from({
            length: visibleSteps
          }, (_, i) => {
            const stepIndex = startStep + i;
            const isCurrent = stepIndex === currentStep;
            return <div key={`step-${stepIndex}`} className={cn("flex-1 text-center text-[11px] font-mono transition-all duration-150", isCurrent ? "text-playhead font-bold scale-125 bg-playhead/10 rounded" : "text-muted-foreground/50")}>
                    {stepIndex}
                  </div>;
          })}
            </div>
            
            <div className="flex">
              <div className="w-20 text-xs font-semibold text-primary/70">Count</div>
              {Array.from({
            length: visibleSteps
          }, (_, i) => {
            const stepIndex = startStep + i;
            const isCurrent = stepIndex === currentStep;
            let displayText = "";
            let textStyle = "text-muted-foreground/60";
            if (pattern.subdivisions && pattern.subdivisions[stepIndex]) {
              const count = pattern.subdivisions[stepIndex];
              displayText = count;
              if (count === '1' || count === '2' || count === '3' || count === '4') {
                textStyle = "text-primary font-bold";
              } else if (count === '&') {
                textStyle = "text-accent font-medium";
              } else if (count === 'e' || count === 'a') {
                textStyle = "text-muted-foreground/70 font-medium";
              }
            } else {
              const posInBar = stepIndex % 16;
              const beatPosition = posInBar % 4;
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
            }
            return <div key={stepIndex} className={cn("flex-1 text-center text-base font-mono transition-all duration-150", textStyle, isCurrent && "scale-125 text-playhead font-extrabold animate-pulse")}>
                    {displayText}
                  </div>;
          })}
            </div>
            
            {/* Progress Bar */}
            <div className="flex mt-1">
              <div className="w-20"></div>
              <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary via-accent to-playhead transition-all duration-75" style={{
              width: `${(currentStep - startStep + 1) / visibleSteps * 100}%`
            }} />
              </div>
            </div>
          </div>}

        {/* Drum Rows */}
        <div className={cn(isLandscape ? "flex-1 flex flex-col" : "")}>
          {drumRows.map(([drumKey, steps]) => {
          const drumInfo = drumLabels[drumKey] || {
            name: drumKey,
            symbol: drumKey === 'Kick' ? '●' : drumKey === 'Snare' ? '×' : drumKey === 'Hi-Hat' ? '○' : drumKey === 'Tom' ? '◆' : '●'
          };
          return <DrumRow key={drumKey} drumKey={drumKey} steps={steps as any[]} drumInfo={drumInfo} visibleSteps={visibleSteps} startStep={startStep} currentStep={currentStep} onStepToggle={onStepToggle} isLandscape={isLandscape} isEditable={!!onStepToggle} />;
        })}
        </div>

        {/* Grid Enhancement */}
        <div className={cn("absolute pointer-events-none", isLandscape ? "inset-2" : "inset-6")}>
          {Array.from({
          length: Math.ceil(visibleSteps / 2)
        }, (_, i) => <div key={i} className="absolute top-0 bottom-0 border-l border-primary/20" style={{
          left: `${88 + i * (100 - 88 / visibleSteps) / (visibleSteps / 2)}%`
        }} />)}
        </div>
      </div>

    </div>;
});
DrumGrid.displayName = 'DrumGrid';