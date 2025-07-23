import { Check, X, AlertTriangle, Target, TrendingUp, Clock, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface TimingStats {
  perfectHits: number;
  goodHits: number;
  missedHits: number;
  totalHits: number;
  currentStreak: number;
  bestStreak: number;
}

interface TimingFeedbackProps {
  lastHitTiming: number | null;
  lastHitAccuracy: 'perfect' | 'good' | 'slightly-off' | 'miss' | null;
  stats: TimingStats;
  isListening: boolean;
  nextBeatTime: number | null;
  currentTime: number;
}

export const TimingFeedback = ({
  lastHitTiming,
  lastHitAccuracy,
  stats,
  isListening,
  nextBeatTime,
  currentTime
}: TimingFeedbackProps) => {
  const getAccuracyColor = (accuracy: string | null) => {
    switch (accuracy) {
      case 'perfect': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'good': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'slightly-off': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'miss': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getAccuracyIcon = (accuracy: string | null) => {
    switch (accuracy) {
      case 'perfect': return <Check className="h-5 w-5" />;
      case 'good': return <Target className="h-5 w-5" />;
      case 'slightly-off': return <AlertTriangle className="h-5 w-5" />;
      case 'miss': return <X className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getAccuracyMessage = (accuracy: string | null, timing: number | null) => {
    if (!accuracy || timing === null) {
      return isListening ? 'Ready to play - hit the beats!' : 'Enable microphone and start playing to see timing feedback';
    }

    const timingMs = Math.round(timing * 1000);
    const early = timing < 0;
    const timingText = `${Math.abs(timingMs)}ms ${early ? 'early' : 'late'}`;

    switch (accuracy) {
      case 'perfect': return `Perfect timing! (${timingText})`;
      case 'good': return `Good hit! (${timingText})`;
      case 'slightly-off': return `Close! (${timingText})`;
      case 'miss': return 'Missed or wrong timing';
      default: return 'Waiting for input...';
    }
  };

  const getAccuracyPercentage = () => {
    if (stats.totalHits === 0) return 100;
    return Math.round(((stats.perfectHits + stats.goodHits) / stats.totalHits) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Last Hit Feedback */}
      <Card className={cn(
        "p-4 border-2 transition-all duration-300",
        getAccuracyColor(lastHitAccuracy)
      )}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getAccuracyIcon(lastHitAccuracy)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">
              {lastHitAccuracy ? lastHitAccuracy.charAt(0).toUpperCase() + lastHitAccuracy.slice(1) : 'Timing Feedback'}
            </h3>
            <p className="text-xs opacity-90 truncate">
              {getAccuracyMessage(lastHitAccuracy, lastHitTiming)}
            </p>
          </div>
          <div className="flex-shrink-0">
            {isListening ? (
              <Mic className="h-4 w-4 text-green-500 animate-pulse" />
            ) : (
              <MicOff className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </h3>
            <span className="text-lg font-bold text-primary">
              {getAccuracyPercentage()}%
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Perfect:</span>
                <span className="font-medium text-green-600">{stats.perfectHits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Good:</span>
                <span className="font-medium text-yellow-600">{stats.goodHits}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Missed:</span>
                <span className="font-medium text-red-600">{stats.missedHits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Streak:</span>
                <span className="font-medium">{stats.currentStreak}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getAccuracyPercentage()}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};