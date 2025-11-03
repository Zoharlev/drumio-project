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

  const renderNote = (drum: string, step: number, y: number) => {
    const note = (pattern[drum as keyof DrumPattern] as any)[step];
    if (!note?.active) return null;

    const x = 80 + (step % stepsPerMeasure) * 40;
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
    <div className="bg-card rounded-lg p-6 overflow-x-auto">
      <div className="min-w-[800px]">
        {Array.from({ length: totalMeasures }).map((_, measureIndex) => {
          const measureStart = measureIndex * stepsPerMeasure;
          const measureEnd = Math.min(measureStart + stepsPerMeasure, complexity.maxSteps);
          
          return (
            <div key={measureIndex} className="mb-8">
              {/* Section label */}
              {pattern.sections && pattern.sections[measureStart] && (
                <div className="text-sm font-semibold text-primary mb-2">
                  {pattern.sections[measureStart]}
                </div>
              )}
              
              <svg
                width="100%"
                height="120"
                viewBox="0 0 800 120"
                className="text-foreground"
              >
                {/* Staff lines */}
                {[0, 10, 20, 30, 40].map((y) => (
                  <line
                    key={y}
                    x1="50"
                    y1={y + 40}
                    x2="750"
                    y2={y + 40}
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.3"
                    className="text-[hsl(var(--grid-line))]"
                  />
                ))}
                
                {/* Measure lines */}
                <line x1="50" y1="35" x2="50" y2="85" stroke="currentColor" strokeWidth="2" className="text-foreground" />
                <line x1="750" y1="35" x2="750" y2="85" stroke="currentColor" strokeWidth="2" className="text-foreground" />
                
                {/* Animated playhead with glow effect */}
                {currentStep >= measureStart && currentStep < measureEnd && (
                  <line
                    x1={80 + (currentStep - measureStart) * 40}
                    y1="20"
                    x2={80 + (currentStep - measureStart) * 40}
                    y2="85"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-[hsl(var(--playhead))] transition-all duration-100"
                    style={{ 
                      filter: "drop-shadow(0 0 8px hsl(var(--playhead) / 0.6))",
                      opacity: 0.9
                    }}
                  />
                )}
                
                {/* Beat subdivisions */}
                {Array.from({ length: stepsPerMeasure / 4 }).map((_, beatIndex) => {
                  const x = 50 + (beatIndex + 1) * (700 / (stepsPerMeasure / 4));
                  return (
                    <line
                      key={beatIndex}
                      x1={x}
                      y1="35"
                      x2={x}
                      y2="85"
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity="0.2"
                    />
                  );
                })}
                
                {/* Clef label */}
                <text x="20" y="65" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">
                  🥁
                </text>
                
                {/* Notes for each drum */}
                {Object.entries(drumStaffPositions).map(([drum, position]) => (
                  <g key={drum}>
                    {Array.from({ length: measureEnd - measureStart }).map((_, i) => {
                      const step = measureStart + i;
                      return renderNote(drum, step, position + 40);
                    })}
                  </g>
                ))}
                
                {/* Time signature (if first measure) */}
                {measureIndex === 0 && (
                  <g>
                    <text x="65" y="55" fontSize="20" fontWeight="bold" textAnchor="middle" fill="currentColor">4</text>
                    <text x="65" y="75" fontSize="20" fontWeight="bold" textAnchor="middle" fill="currentColor">4</text>
                  </g>
                )}
              </svg>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-sm font-medium text-muted-foreground mb-3">Legend:</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">●</span>
            <span>Kick Drum</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">×</span>
            <span>Snare</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">○</span>
            <span>Hi-Hat (Closed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">◎</span>
            <span>Hi-Hat (Open)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">◆</span>
            <span>Tom</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">☆</span>
            <span>Crash Cymbal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
