import { Button } from "@/components/ui/button";
import { Trash2, Volume2, VolumeX, Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduledNote {
  time: number;
  instrument: string;
  step: number;
  hit: boolean;
  correct: boolean;
  wrongInstrument: boolean;
  slightlyOff: boolean;
}

interface DrumGridProps {
  pattern: {
    [key: string]: boolean[];
  };
  currentStep: number;
  onStepToggle: (drum: string, step: number) => void;
  onClearPattern: () => void;
  metronomeEnabled: boolean;
  onMetronomeToggle: () => void;
  noteResults?: ScheduledNote[];
  isMicMode?: boolean;
  currentTimeInSeconds?: number;
}

const drumLabels: {
  [key: string]: {
    name: string;
    symbol: string;
    color: string;
  };
} = {
  kick: {
    name: "Kick",
    symbol: "●",
    color: "bg-red-500"
  },
  snare: {
    name: "Snare",
    symbol: "×",
    color: "bg-blue-500"
  },
  hihat: {
    name: "Hi-Hat",
    symbol: "○",
    color: "bg-yellow-500"
  },
  openhat: {
    name: "Open Hat",
    symbol: "◎",
    color: "bg-green-500"
  }
};

export const DrumGrid = ({
  pattern,
  currentStep,
  onStepToggle,
  onClearPattern,
  metronomeEnabled,
  onMetronomeToggle,
  noteResults = [],
  isMicMode = false,
  currentTimeInSeconds = 0
}: DrumGridProps) => {
  const getDotFeedback = (drumKey: string, stepIndex: number) => {
    if (!isMicMode) return null;

    // Find the scheduled note for this step
    const scheduledNote = noteResults.find(note => note.step === stepIndex && note.instrument === drumKey);
    if (!scheduledNote || !scheduledNote.hit) return null;

    if (scheduledNote.correct) {
      return {
        color: "bg-green-500",
        icon: <Check className="w-3 h-3 text-white" />
      };
    } else if (scheduledNote.slightlyOff) {
      return {
        color: "bg-yellow-500",
        icon: <AlertTriangle className="w-3 h-3 text-white" />
      };
    } else {
      return {
        color: "bg-red-500",
        icon: <X className="w-3 h-3 text-white" />
      };
    }
  };

  const getCurrentActiveNote = (drumKey: string, stepIndex: number) => {
    if (!isMicMode) return false;
    
    // Check if this step represents the current beat being played
    return stepIndex === currentStep && pattern[drumKey][stepIndex];
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Drum Pattern</h3>
          <span className="text-sm text-muted-foreground">
            {isMicMode ? "Microphone Mode" : "Edit Mode"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMetronomeToggle}
            title={metronomeEnabled ? "Disable metronome" : "Enable metronome"}
          >
            {metronomeEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearPattern}
            title="Clear pattern"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Beat numbers */}
      <div className="grid grid-cols-17 gap-1 text-xs text-center text-muted-foreground">
        <div className="w-16"></div>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className="p-1">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Quarter note indicators */}
      <div className="grid grid-cols-17 gap-1 text-xs text-center">
        <div className="w-16"></div>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className="p-1">
            {i % 4 === 0 && (
              <div className="w-2 h-2 bg-primary rounded-full mx-auto"></div>
            )}
          </div>
        ))}
      </div>

      {/* Drum rows */}
      <div className="space-y-2">
        {Object.entries(drumLabels).map(([drumKey, drumInfo]) => (
          <div key={drumKey} className="grid grid-cols-17 gap-1 items-center">
            {/* Drum label */}
            <div className="w-16 text-sm font-medium flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", drumInfo.color)}></div>
              <span>{drumInfo.name}</span>
            </div>

            {/* Step buttons */}
            {Array.from({ length: 16 }, (_, stepIndex) => {
              const isActive = pattern[drumKey][stepIndex];
              const isCurrentStep = stepIndex === currentStep;
              const feedback = getDotFeedback(drumKey, stepIndex);
              const isCurrentActiveNote = getCurrentActiveNote(drumKey, stepIndex);

              return (
                <button
                  key={stepIndex}
                  onClick={() => onStepToggle(drumKey, stepIndex)}
                  disabled={isMicMode}
                  className={cn(
                    "relative h-8 w-8 rounded border-2 transition-all duration-150",
                    "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                    isActive
                      ? cn("border-primary", drumInfo.color, "text-white")
                      : "border-muted bg-muted/50 hover:bg-muted",
                    isCurrentStep && "ring-2 ring-primary ring-offset-1",
                    isCurrentActiveNote && "animate-pulse scale-110",
                    isMicMode && "cursor-not-allowed opacity-75"
                  )}
                  title={`${drumInfo.name} - Step ${stepIndex + 1}`}
                >
                  {/* Drum symbol */}
                  <span className="text-lg font-bold">
                    {isActive ? drumInfo.symbol : ""}
                  </span>

                  {/* Feedback overlay */}
                  {feedback && (
                    <div className={cn(
                      "absolute inset-0 rounded flex items-center justify-center",
                      feedback.color
                    )}>
                      {feedback.icon}
                    </div>
                  )}

                  {/* Current step indicator */}
                  {isCurrentStep && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Quarter notes</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-primary rounded animate-ping"></div>
            <span>Current step</span>
          </div>
        </div>
        {isMicMode && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
              <span>Perfect hit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded flex items-center justify-center">
                <AlertTriangle className="w-2 h-2 text-white" />
              </div>
              <span>Good hit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded flex items-center justify-center">
                <X className="w-2 h-2 text-white" />
              </div>
              <span>Miss/Wrong</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};