import { DrumPattern, PatternComplexity } from "@/types/drumPatterns";
import { cn } from "@/lib/utils";

interface NotationViewProps {
  pattern: DrumPattern;
  currentStep: number;
  complexity: PatternComplexity;
}

const drumStaffPositions = {
  kick: 40,      // Bottom space
  snare: 20,     // Middle line
  tom: 10,       // Above snare
  crash: 0,      // Above tom
  hihat: -5,     // Top space
  openhat: -5,   // Same as hihat
};

export const NotationView = ({ pattern, currentStep, complexity }: NotationViewProps) => {
  const stepsPerMeasure = complexity.hasSixteenthNotes ? 16 : 8;
  const totalMeasures = Math.ceil(complexity.maxSteps / stepsPerMeasure);
  const stepsPerView = stepsPerMeasure;
  const currentView = Math.floor(currentStep / stepsPerView);
  const startStep = currentView * stepsPerView;
  const endStep = Math.min(startStep + stepsPerView, complexity.maxSteps);
  const visibleSteps = endStep - startStep;

  const renderNote = (drum: string, step: number, x: number, y: number) => {
    const note = (pattern[drum as keyof DrumPattern] as any)[step];
    if (!note?.active) return null;

    const noteType = note.type || 'normal';
    const isOpen = (note as any)?.open;
    const isCurrentStep = step === currentStep;

    // Note head based on drum type
    let noteSymbol: JSX.Element;
    
    if (drum === 'kick') {
      // Filled note head
      noteSymbol = (
        <ellipse 
          cx={x} 
          cy={y} 
          rx="6" 
          ry="5" 
          fill="currentColor"
          className={cn(
            "transition-all duration-200",
            isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
          )}
        />
      );
    } else if (drum === 'snare') {
      // X note head
      noteSymbol = (
        <g className={cn(
          "transition-all duration-200",
          isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
        )}>
          <line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} stroke="currentColor" strokeWidth="2" />
          <line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} stroke="currentColor" strokeWidth="2" />
        </g>
      );
    } else if (drum === 'tom') {
      // Diamond note head
      noteSymbol = (
        <path
          d={`M ${x},${y - 6} L ${x + 6},${y} L ${x},${y + 6} L ${x - 6},${y} Z`}
          fill="currentColor"
          className={cn(
            "transition-all duration-200",
            isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
          )}
        />
      );
    } else if (drum === 'crash') {
      // Star/X note head for crash
      noteSymbol = (
        <g className={cn(
          "transition-all duration-200",
          isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
        )}>
          <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke="currentColor" strokeWidth="2" />
          <line x1={x - 6} y1={y + 6} x2={x + 6} y2={y - 6} stroke="currentColor" strokeWidth="2" />
          <line x1={x} y1={y - 7} x2={x} y2={y + 7} stroke="currentColor" strokeWidth="2" />
          <line x1={x - 7} y1={y} x2={x + 7} y2={y} stroke="currentColor" strokeWidth="2" />
        </g>
      );
    } else {
      // Circle note head for hi-hat
      noteSymbol = (
        <g className={cn(
          "transition-all duration-200",
          isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
        )}>
          <circle 
            cx={x} 
            cy={y} 
            r="5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill={isOpen ? "none" : "currentColor"} 
          />
          {isOpen && (
            <circle cx={x} cy={y - 18} r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          )}
        </g>
      );
    }

    return (
      <g key={`${drum}-${step}`}>
        {/* Stem */}
        <line 
          x1={x} 
          y1={y} 
          x2={x} 
          y2={y - 30} 
          stroke="currentColor" 
          strokeWidth="1.5"
          className={cn(
            "transition-all duration-200",
            isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
          )}
        />
        
        {/* Note head */}
        {noteSymbol}
        
        {/* Ghost note parentheses */}
        {noteType === 'ghost' && (
          <g opacity="0.5" className={cn(
            "transition-all duration-200",
            isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
          )}>
            <text x={x - 10} y={y + 3} fontSize="16" fill="currentColor">(</text>
            <text x={x + 6} y={y + 3} fontSize="16" fill="currentColor">)</text>
          </g>
        )}
        
        {/* Accent mark */}
        {noteType === 'accent' && (
          <text 
            x={x} 
            y={y - 35} 
            fontSize="14" 
            fontWeight="bold" 
            textAnchor="middle" 
            fill="currentColor"
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )}
          >
            {'>'}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="bg-card rounded-lg p-4">
        <div className="flex gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <ellipse cx="10" cy="10" rx="7" ry="5" fill="currentColor" className="text-[hsl(var(--note-active))]" />
            </svg>
            <span>Kick / Snare / Tom</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2" className="text-[hsl(var(--note-active))]" />
              <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="2" className="text-[hsl(var(--note-active))]" />
            </svg>
            <span>Crash</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[hsl(var(--note-active))]" />
            </svg>
            <span>Hi-Hat (Closed)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[hsl(var(--note-active))]" />
              <circle cx="10" cy="4" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[hsl(var(--note-active))]" />
            </svg>
            <span>Hi-Hat (Open)</span>
          </div>
        </div>
      </div>

      {/* Notation Container */}
      <div className="relative bg-card rounded-lg p-8 shadow-elevated overflow-x-auto">
        <svg width="100%" height="200" className="overflow-visible min-w-[800px]" viewBox="0 0 1000 200">
          {/* Staff lines */}
          {[0, 1, 2, 3, 4].map((line) => (
            <line
              key={line}
              x1="40"
              x2="1000"
              y1={40 + line * 20}
              y2={40 + line * 20}
              stroke="currentColor"
              strokeWidth="1"
              className="text-[hsl(var(--grid-line))]"
            />
          ))}

          {/* Bar lines (every 4 steps = 1 beat) */}
          {Array.from({ length: Math.ceil(visibleSteps / 4) + 1 }, (_, i) => {
            const x = 40 + (i * 4 * 920) / visibleSteps;
            return (
              <line
                key={i}
                x1={x}
                x2={x}
                y1={40}
                y2={120}
                stroke="currentColor"
                strokeWidth={i === 0 ? "3" : "1.5"}
                className="text-primary/40"
              />
            );
          })}

          {/* Beat numbers (1, 2, 3, 4) */}
          {Array.from({ length: visibleSteps }, (_, i) => {
            const stepIndex = startStep + i;
            const x = 60 + (i * 920) / visibleSteps;
            const posInBar = stepIndex % (complexity.hasSixteenthNotes ? 16 : 8);
            const stepsPerBeat = complexity.hasSixteenthNotes ? 4 : 2;
            
            if (posInBar % stepsPerBeat === 0) {
              const beatNum = Math.floor(posInBar / stepsPerBeat) + 1;
              return (
                <text
                  key={i}
                  x={x}
                  y={25}
                  textAnchor="middle"
                  className="text-xs font-bold fill-primary"
                >
                  {beatNum}
                </text>
              );
            }
            return null;
          })}

          {/* Animated playhead with glow effect */}
          {currentStep >= startStep && currentStep < endStep && (
            <line
              x1={60 + ((currentStep - startStep) * 920) / visibleSteps}
              x2={60 + ((currentStep - startStep) * 920) / visibleSteps}
              y1={20}
              y2={140}
              stroke="currentColor"
              strokeWidth="3"
              className="text-[hsl(var(--playhead))] transition-all duration-100"
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--playhead) / 0.6))",
              }}
            />
          )}

          {/* Notes for each drum */}
          {Object.entries(drumStaffPositions).map(([drum, position]) => (
            <g key={drum}>
              {Array.from({ length: visibleSteps }).map((_, i) => {
                const step = startStep + i;
                if (step >= complexity.maxSteps) return null;
                const x = 60 + (i * 920) / visibleSteps;
                const y = position;
                return renderNote(drum, step, x, y);
              })}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
