import { DrumPattern, PatternComplexity } from "@/types/drumPatterns";
import { cn } from "@/lib/utils";

interface NotationViewProps {
  pattern: DrumPattern;
  currentStep: number;
  scrollOffset: number;
  complexity: PatternComplexity;
}

const drumStaffPositions: {
  [key: string]: { y: number; noteType: 'note' | 'x' | 'open' };
} = {
  kick: { y: 120, noteType: 'note' },
  snare: { y: 80, noteType: 'note' },
  tom: { y: 100, noteType: 'note' },
  crash: { y: 20, noteType: 'x' },
  ride: { y: 30, noteType: 'x' },
  hihat: { y: 40, noteType: 'x' },
  openhat: { y: 40, noteType: 'open' },
  ghostsnare: { y: 80, noteType: 'note' },
};

export const NotationView = ({ pattern, currentStep, scrollOffset, complexity }: NotationViewProps) => {
  const STEP_WIDTH = 46; // Width per step in pixels
  const visibleStepsCount = 20; // Show 20 steps at a time
  const STAFF_LEFT_MARGIN = 40;

  // Calculate visible window based on scroll offset
  const maxStart = Math.max(0, complexity.maxSteps - visibleStepsCount);
  const startStep = Math.min(Math.max(0, scrollOffset), maxStart);
  const endStep = Math.min(startStep + visibleStepsCount, complexity.maxSteps);
  const visibleSteps = endStep - startStep;

  // Calculate scroll transform
  const scrollTransform = `translateX(${-scrollOffset * STEP_WIDTH}px)`;

  // Calculate playhead position (relative to visible window)
  const playheadX = STAFF_LEFT_MARGIN + 20 + (currentStep - startStep) * STEP_WIDTH;

  const renderNote = (drum: string, step: number, x: number, y: number) => {
    const note = (pattern[drum as keyof DrumPattern] as any)[step];
    if (!note?.active) return null;

    const drumInfo = drumStaffPositions[drum];
    if (!drumInfo) return null;

    const noteType = note.type || 'normal';
    const isCurrentStep = step === currentStep;

    if (drumInfo.noteType === 'x') {
      // X-shaped notehead for crash and closed hi-hat
      return (
        <g key={`${drum}-${step}`}>
          <line 
            x1={x - 6} 
            y1={y - 6} 
            x2={x + 6} 
            y2={y + 6} 
            stroke="currentColor" 
            strokeWidth="2" 
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )} 
          />
          <line 
            x1={x - 6} 
            y1={y + 6} 
            x2={x + 6} 
            y2={y - 6} 
            stroke="currentColor" 
            strokeWidth="2" 
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )} 
          />
          <line 
            x1={x} 
            y1={y + 6} 
            x2={x} 
            y2={y - 30} 
            stroke="currentColor" 
            strokeWidth="2" 
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )} 
          />
        </g>
      );
    } else if (drumInfo.noteType === 'open') {
      // Open hi-hat: X notehead with small circle above
      return (
        <g key={`${drum}-${step}`}>
          {/* X notehead */}
          <line 
            x1={x - 6} 
            y1={y - 6} 
            x2={x + 6} 
            y2={y + 6} 
            stroke="currentColor" 
            strokeWidth="2" 
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )} 
          />
          <line 
            x1={x - 6} 
            y1={y + 6} 
            x2={x + 6} 
            y2={y - 6} 
            stroke="currentColor" 
            strokeWidth="2" 
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )} 
          />
          {/* Stem */}
          <line 
            x1={x} 
            y1={y + 6} 
            x2={x} 
            y2={y - 30} 
            stroke="currentColor" 
            strokeWidth="2" 
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )} 
          />
          {/* Small circle above to indicate "open" */}
          <circle 
            cx={x} 
            cy={y - 18} 
            r="4" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )} 
          />
        </g>
      );
    } else {
      // Filled ellipse note for kick, snare, tom
      return (
        <g key={`${drum}-${step}`}>
          <ellipse 
            cx={x} 
            cy={y} 
            rx="7" 
            ry="5" 
            fill="currentColor" 
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )} 
          />
          <line 
            x1={x + 7} 
            y1={y} 
            x2={x + 7} 
            y2={y - 30} 
            stroke="currentColor" 
            strokeWidth="2" 
            className={cn(
              "transition-all duration-200",
              isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
            )} 
          />
          {/* Ghost note parentheses */}
          {noteType === 'ghost' && (
            <g opacity="0.5">
              <text 
                x={x - 10} 
                y={y + 3} 
                fontSize="16" 
                fill="currentColor"
                className={cn(
                  "transition-all duration-200",
                  isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
                )}
              >
                (
              </text>
              <text 
                x={x + 6} 
                y={y + 3} 
                fontSize="16" 
                fill="currentColor"
                className={cn(
                  "transition-all duration-200",
                  isCurrentStep ? "text-[hsl(var(--playhead))]" : "text-[hsl(var(--note-active))]"
                )}
              >
                )
              </text>
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
    }
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
            <span>Crash / Ride</span>
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
      <div className="relative bg-card rounded-lg p-8 shadow-elevated overflow-hidden">
        <svg width="100%" height="200" className="overflow-visible min-w-[920px]" viewBox="0 0 1000 200">
          {/* Layer 1: Fixed staff lines */}
          {[0, 1, 2, 3, 4].map((line) => (
            <line
              key={line}
              x1={STAFF_LEFT_MARGIN}
              x2="1000"
              y1={40 + line * 20}
              y2={40 + line * 20}
              stroke="currentColor"
              strokeWidth="1"
              className="text-[hsl(var(--grid-line))]"
            />
          ))}

          {/* Layer 2: Scrolling bar lines and beat numbers */}
          <g style={{ transform: scrollTransform, transition: 'transform 75ms linear' }}>
            {/* Bar lines */}
            {Array.from({ length: Math.ceil(complexity.maxSteps / 4) + 1 }, (_, i) => {
              const x = STAFF_LEFT_MARGIN + 20 + (i * 4 * STEP_WIDTH);
              return (
                <line
                  key={`bar-${i}`}
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

            {/* Beat numbers */}
            {Array.from({ length: complexity.maxSteps }, (_, i) => {
              const x = STAFF_LEFT_MARGIN + 20 + (i * STEP_WIDTH);
              const posInBar = i % (complexity.hasSixteenthNotes ? 16 : 8);
              const stepsPerBeat = complexity.hasSixteenthNotes ? 4 : 2;
              
              if (posInBar % stepsPerBeat === 0) {
                const beatNum = Math.floor(posInBar / stepsPerBeat) + 1;
                return (
                  <text
                    key={`beat-${i}`}
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
          </g>

          {/* Layer 3: Scrolling notes */}
          <g style={{ transform: scrollTransform, transition: 'transform 75ms linear' }}>
            {Object.entries(drumStaffPositions).map(([drum, drumInfo]) => (
              <g key={drum}>
                {Array.from({ length: complexity.maxSteps }).map((_, i) => {
                  const x = STAFF_LEFT_MARGIN + 20 + (i * STEP_WIDTH);
                  const y = drumInfo.y;
                  return renderNote(drum, i, x, y);
                })}
              </g>
            ))}
          </g>

          {/* Layer 4: Fixed playhead */}
          {currentStep >= startStep && currentStep < endStep && (
            <line
              x1={playheadX}
              x2={playheadX}
              y1={20}
              y2={140}
              stroke="currentColor"
              strokeWidth="3"
              className="text-[hsl(var(--playhead))]"
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--playhead) / 0.6))",
                transition: "x1 100ms ease-out, x2 100ms ease-out"
              }}
            />
          )}
        </svg>
      </div>
    </div>
  );
};
