import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Play, Pause, RotateCcw, Mic, MicOff, Volume2, Settings } from "lucide-react";
import { DrumGrid } from "@/components/practice-session/DrumGrid";
import { TimingFeedback } from "@/components/practice-session/TimingFeedback";
import { useToast } from "@/hooks/use-toast";
import { useMicrophoneDetection } from "@/hooks/useMicrophoneDetection";

interface DrumPattern {
  [key: string]: boolean[];
}

interface ScheduledNote {
  time: number;
  instrument: string;
  step: number;
  hit: boolean;
  correct: boolean;
  wrongInstrument: boolean;
  slightlyOff: boolean;
}

interface TimingStats {
  perfectHits: number;
  goodHits: number;
  missedHits: number;
  totalHits: number;
  currentStreak: number;
  bestStreak: number;
}

const PracticeSession = () => {
  const { lessonId, practiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Practice session state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(60);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentTimeInSeconds, setCurrentTimeInSeconds] = useState<number>(0);
  const [completedNotesCount, setCompletedNotesCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  
  // Timing feedback states
  const [lastHitTiming, setLastHitTiming] = useState<number | null>(null);
  const [lastHitAccuracy, setLastHitAccuracy] = useState<'perfect' | 'good' | 'slightly-off' | 'miss' | null>(null);
  const [timingStats, setTimingStats] = useState<TimingStats>({
    perfectHits: 0,
    goodHits: 0,
    missedHits: 0,
    totalHits: 0,
    currentStreak: 0,
    bestStreak: 0
  });
  
  const [scheduledNotes, setScheduledNotes] = useState<ScheduledNote[]>([]);
  const [noteResults, setNoteResults] = useState<ScheduledNote[]>([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [pattern, setPattern] = useState<DrumPattern>({
    kick: new Array(16).fill(false),
    snare: new Array(16).fill(false),
    hihat: new Array(16).fill(false),
    openhat: new Array(16).fill(false)
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Fetch practice details
  const { data: practice, isLoading } = useQuery({
    queryKey: ["practice", practiceId],
    queryFn: async () => {
      if (!practiceId) return null;
      
      const { data, error } = await supabase
        .from("practices")
        .select(`
          id,
          title,
          description,
          pattern,
          tempo,
          focus,
          chords_file_url,
          sound_file_url,
          practice_type (
            id,
            title
          )
        `)
        .eq("id", practiceId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!practiceId,
  });

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Load pattern from practice data
  useEffect(() => {
    if (practice?.pattern) {
      try {
        const parsedPattern = typeof practice.pattern === 'string' 
          ? JSON.parse(practice.pattern) 
          : practice.pattern;
        setPattern(parsedPattern);
      } catch (error) {
        console.error("Error parsing pattern:", error);
      }
    }
    
    if (practice?.tempo) {
      setBpm(parseInt(practice.tempo) || 60);
    }
  }, [practice]);

  // Generate scheduled notes from pattern
  const generateScheduledNotes = (pattern: DrumPattern, bpm: number) => {
    const stepDuration = 60 / bpm / 4; // Duration of each 16th note in seconds
    const notes: ScheduledNote[] = [];

    Object.entries(pattern).forEach(([instrument, steps]) => {
      steps.forEach((active, stepIndex) => {
        if (active) {
          notes.push({
            time: stepIndex * stepDuration,
            instrument,
            step: stepIndex,
            hit: false,
            correct: false,
            wrongInstrument: false,
            slightlyOff: false
          });
        }
      });
    });

    return notes.sort((a, b) => a.time - b.time);
  };

  // Update scheduled notes when pattern or BPM changes
  useEffect(() => {
    const newScheduledNotes = generateScheduledNotes(pattern, bpm);
    setScheduledNotes(newScheduledNotes);
    setNoteResults(newScheduledNotes.map(note => ({ ...note })));
  }, [pattern, bpm]);

  const stepDuration = 60 / bpm / 4 * 1000; // 16th notes

  // Main playback interval
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % 16;
          const timeElapsed = (Date.now() - startTime) / 1000;
          setCurrentTimeInSeconds(timeElapsed);
          return nextStep;
        });
      }, stepDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, stepDuration, startTime]);

  // Metronome for main playback
  useEffect(() => {
    if (isPlaying && metronomeEnabled && currentStep % 4 === 0) {
      playMetronome();
    }
  }, [currentStep, isPlaying, metronomeEnabled]);

  const playMetronome = () => {
    if (!audioContextRef.current) return;
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.frequency.setValueAtTime(1000, context.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.05);
  };

  const onHitDetected = (hit: any) => {
    if (!isPlaying) return;
    
    const currentTime = (Date.now() - startTime) / 1000;
    setCurrentTimeInSeconds(currentTime);
    
    // Simple timing feedback for now
    setLastHitAccuracy('good');
    setCompletedNotesCount(prev => prev + 1);
    
    toast({
      title: "Hit detected!",
      description: `Note ${completedNotesCount + 1} played`
    });
  };

  const {
    hasPermission,
    error,
    initializeMicrophone,
    audioStream
  } = useMicrophoneDetection({
    isListening: isMicListening,
    onHitDetected
  });

  const togglePlay = () => {
    if (!isPlaying) {
      const currentTime = Date.now();
      setStartTime(currentTime);
      setCurrentStep(0);
      setCurrentTimeInSeconds(0);
      setCompletedNotesCount(0);
      setCurrentNoteIndex(0);
      setSessionCompleted(false);
      
      toast({
        title: "Practice started",
        description: "Follow the rhythm pattern!"
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMicrophone = async () => {
    if (!hasPermission) {
      await initializeMicrophone();
    }
    if (hasPermission) {
      setIsMicListening(!isMicListening);
      toast({
        title: isMicListening ? "Microphone disabled" : "Microphone enabled",
        description: isMicListening ? "Click mode active" : "Ready to detect hits"
      });
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setCompletedNotesCount(0);
    setCurrentNoteIndex(0);
    setSessionCompleted(false);
    setLastHitTiming(null);
    setLastHitAccuracy(null);
    setTimingStats({
      perfectHits: 0,
      goodHits: 0,
      missedHits: 0,
      totalHits: 0,
      currentStreak: 0,
      bestStreak: 0
    });
    
    toast({
      title: "Reset complete",
      description: "Practice session reset"
    });
  };

  const changeBpm = (value: number[]) => {
    setBpm(value[0]);
  };

  const toggleStep = (drum: string, step: number) => {
    if (!isMicListening) {
      setPattern(prev => ({
        ...prev,
        [drum]: prev[drum].map((active, index) => index === step ? !active : active)
      }));
    }
  };

  const clearPattern = () => {
    setPattern({
      kick: new Array(16).fill(false),
      snare: new Array(16).fill(false),
      hihat: new Array(16).fill(false),
      openhat: new Array(16).fill(false)
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Practice not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{practice.title}</h1>
              <p className="text-muted-foreground">{practice.practice_type?.title}</p>
            </div>
          </div>
        </div>

        {/* Practice Description */}
        {practice.description && (
          <Card className="p-4 mb-6">
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {practice.description}
            </p>
          </Card>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Playback Controls */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Playback Controls</h3>
            <div className="flex gap-2 mb-4">
              <Button onClick={togglePlay} size="sm" className="flex-1">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button onClick={reset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>BPM: {bpm}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                >
                  <Volume2 className={`h-4 w-4 ${metronomeEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
              </div>
              <Slider
                value={[bpm]}
                onValueChange={changeBpm}
                min={40}
                max={120}
                step={5}
                className="w-full"
              />
            </div>
          </Card>

          {/* Microphone Controls */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Audio Input</h3>
            <Button
              onClick={toggleMicrophone}
              variant={isMicListening ? "default" : "outline"}
              size="sm"
              className="w-full mb-2"
            >
              {isMicListening ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
              {isMicListening ? "Listening" : "Enable Mic"}
            </Button>
            {error && (
              <p className="text-xs text-destructive mt-2">{error}</p>
            )}
          </Card>

          {/* Session Stats */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Session Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Notes played:</span>
                <span>{completedNotesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span>{timingStats.totalHits > 0 ? Math.round(((timingStats.perfectHits + timingStats.goodHits) / timingStats.totalHits) * 100) : 100}%</span>
              </div>
              <div className="flex justify-between">
                <span>Streak:</span>
                <span>{timingStats.currentStreak}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Timing Feedback */}
        <div className="mb-6">
          <TimingFeedback
            lastHitTiming={lastHitTiming}
            lastHitAccuracy={lastHitAccuracy}
            stats={timingStats}
            isListening={isMicListening}
            nextBeatTime={null}
            currentTime={currentTimeInSeconds}
          />
        </div>

        {/* Drum Grid */}
        <div className="mb-6">
          <DrumGrid
            pattern={pattern}
            currentStep={currentStep}
            onStepToggle={toggleStep}
            onClearPattern={clearPattern}
            metronomeEnabled={metronomeEnabled}
            onMetronomeToggle={() => setMetronomeEnabled(!metronomeEnabled)}
            noteResults={noteResults}
            isMicMode={isMicListening}
            currentTimeInSeconds={currentTimeInSeconds}
          />
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;