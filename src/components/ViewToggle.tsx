import { Button } from "@/components/ui/button";
import { Grid3x3, FileMusic } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = 'grid' | 'notation';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('grid')}
        className={cn(
          "gap-2 transition-all duration-200",
          currentView === 'grid'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="text-sm font-medium">Grid</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('notation')}
        className={cn(
          "gap-2 transition-all duration-200",
          currentView === 'notation'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <FileMusic className="h-4 w-4" />
        <span className="text-sm font-medium">Notation</span>
      </Button>
    </div>
  );
};
