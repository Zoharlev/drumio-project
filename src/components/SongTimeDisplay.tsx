import { cn } from "@/lib/utils";

interface Section {
  name: string;
  startStep: number;
  endStep: number;
}

interface SongTimeDisplayProps {
  currentTime: number; // in milliseconds
  totalTime: number;
  sections: Section[];
  currentStep: number;
  maxSteps: number;
  onSeek: (step: number) => void;
}

export const SongTimeDisplay = ({
  currentTime,
  totalTime,
  sections,
  currentStep,
  maxSteps,
  onSeek,
}: SongTimeDisplayProps) => {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const progress = maxSteps > 0 ? (currentStep / maxSteps) * 100 : 0;
  
  // Find current section
  const currentSection = sections.find(
    (section) => currentStep >= section.startStep && currentStep <= section.endStep
  );

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = x / rect.width;
    const targetStep = Math.floor(clickProgress * maxSteps);
    onSeek(targetStep);
  };

  return (
    <div className="bg-card rounded-lg p-4 space-y-3">
      {/* Time and Section Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-mono font-bold text-foreground">
            {formatTime(currentTime)}
          </span>
          <span className="text-sm text-muted-foreground">
            / {formatTime(totalTime)}
          </span>
        </div>
        
        {currentSection && (
          <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full">
            <span className="text-sm font-semibold">{currentSection.name}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div
        className="relative h-3 bg-muted rounded-full cursor-pointer group overflow-hidden"
        onClick={handleProgressClick}
      >
        {/* Section markers */}
        {sections.map((section, index) => {
          const sectionStart = (section.startStep / maxSteps) * 100;
          const sectionWidth = ((section.endStep - section.startStep) / maxSteps) * 100;
          
          return (
            <div
              key={index}
              className="absolute top-0 bottom-0 border-r-2 border-border/50"
              style={{ left: `${sectionStart}%`, width: `${sectionWidth}%` }}
              title={section.name}
            />
          );
        })}
        
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        
        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg transition-all duration-100"
          style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Section markers labels */}
      {sections.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {sections.map((section, index) => {
            const isCurrentSection = currentSection?.name === section.name;
            return (
              <button
                key={index}
                onClick={() => onSeek(section.startStep)}
                className={cn(
                  "text-xs px-2 py-1 rounded-md transition-all duration-200",
                  isCurrentSection
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {section.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
