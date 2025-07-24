import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Plus, Minus } from "lucide-react";
import { DrumGrid } from "./DrumGrid";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DrumPattern {
  [key: string]: boolean[];
}

export const PracticeSession = () => {
  const navigate = useNavigate();
  const { practiceId, lessonId } = useParams<{ practiceId: string; lessonId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [pattern, setPattern] = useState<DrumPattern>({
    kick: new Array(16).fill(false),
    snare: new Array(16).fill(false),
    hihat: new Array(16).fill(false),
    openhat: new Array(16).fill(false),
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  // Fetch practice data
  const { data: practice, isLoading } = useQuery({
    queryKey: ["practice", practiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practices")
        .select(`
          *,
          practice_type:practice_type(*)
        `)
        .eq("id", practiceId)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  });

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Load pattern from practice notes field
  useEffect(() => {
    if ((practice as any)?.practice_note) {
      try {
        // Parse the practice_note field as CSV-like format
        const lines = (practice as any).practice_note.split('\n');
        const newPattern: DrumPattern = {
          kick: new Array(16).fill(false),
          snare: new Array(16).fill(false),
          hihat: new Array(16).fill(false),
          openhat: new Array(16).fill(false),
        };

        lines.forEach((line: string) => {
          if (line.startsWith('Hi-Hat,') || line.startsWith('Kick,') || line.startsWith('Snare,')) {
            const parts = line.split(',');
            const drumType = parts[0].toLowerCase();
            
            // Map drum names to our pattern keys
            let patternKey = '';
            if (drumType === 'hi-hat') patternKey = 'hihat';
            else if (drumType === 'kick') patternKey = 'kick';
            else if (drumType === 'snare') patternKey = 'snare';

            if (patternKey && newPattern[patternKey]) {
              // Parse the pattern - 'X' means hit, empty means rest
              for (let i = 1; i < Math.min(parts.length, 17); i++) {
                const stepIndex = (i - 1) * 4; // Convert 4/4 beats to 16th notes
                if (stepIndex < 16 && parts[i]?.trim() === 'X') {
                  newPattern[patternKey][stepIndex] = true;
                }
              }
            }
          }
        });

        setPattern(newPattern);
      } catch (error) {
        console.error('Error parsing practice notes:', error);
        // Fallback to basic pattern if parsing fails
        const hihatPattern = new Array(16).fill(false);
        hihatPattern[0] = true;
        hihatPattern[4] = true;
        hihatPattern[8] = true;
        hihatPattern[12] = true;

        setPattern({
          kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
          snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
          hihat: hihatPattern,
          openhat: new Array(16).fill(false),
        });
      }
    }
  }, [practice]);

  // Step timing based on BPM
  const stepDuration = (60 / bpm / 4) * 1000; // 16th notes

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % 16;
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
  }, [isPlaying, stepDuration]);

  // Play sounds based on currentStep
  useEffect(() => {
    if (isPlaying) {
      // Play sounds for active notes at current step
      Object.entries(pattern).forEach(([drum, steps]) => {
        if (steps[currentStep]) {
          playDrumSound(drum);
        }
      });

      // Play metronome on beat 1
      if (metronomeEnabled && currentStep % 4 === 0) {
        playMetronome();
      }
    }
  }, [currentStep, isPlaying, pattern, metronomeEnabled]);

  const playDrumSound = (drum: string) => {
    if (!audioContextRef.current) return;

    const context = audioContextRef.current;

    if (drum === 'hihat' || drum === 'openhat') {
      // Create white noise for hi-hat sounds
      const bufferSize = context.sampleRate * 0.1;
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = context.createBufferSource();
      noise.buffer = buffer;

      if (drum === 'openhat') {
        const highpassFilter = context.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.setValueAtTime(6000, context.currentTime);
        
        const gainNode = context.createGain();
        noise.connect(highpassFilter);
        highpassFilter.connect(gainNode);
        gainNode.connect(context.destination);

        const duration = 0.4;
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.35, context.currentTime + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

        noise.start(context.currentTime);
        noise.stop(context.currentTime + duration);
      } else {
        const highpassFilter = context.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.setValueAtTime(8000, context.currentTime);
        
        const gainNode = context.createGain();
        noise.connect(highpassFilter);
        highpassFilter.connect(gainNode);
        gainNode.connect(context.destination);

        const duration = 0.08;
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

        noise.start(context.currentTime);
        noise.stop(context.currentTime + duration);
      }
    } else if (drum === 'snare') {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.frequency.setValueAtTime(200, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, context.currentTime + 0.02);
      oscillator.type = 'triangle';
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      const duration = 0.15;
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, context.currentTime + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } else {
      // Kick drum
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.frequency.setValueAtTime(60, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(35, context.currentTime + 0.05);
      oscillator.type = 'sine';
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      const duration = 0.3;
      gainNode.gain.setValueAtTime(0.5, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    }
  };

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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast({
        title: "Playing",
        description: "Practice session started",
      });
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    toast({
      title: "Reset",
      description: "Practice session reset to beginning",
    });
  };

  const changeBpm = (delta: number) => {
    setBpm(prev => Math.max(60, Math.min(200, prev + delta)));
  };

  const toggleStep = (drum: string, step: number) => {
    setPattern(prev => ({
      ...prev,
      [drum]: prev[drum].map((active, index) =>
        index === step ? !active : active
      )
    }));
  };

  const clearPattern = () => {
    setPattern({
      kick: new Array(16).fill(false),
      snare: new Array(16).fill(false),
      hihat: new Array(16).fill(false),
      openhat: new Array(16).fill(false),
    });
    toast({
      title: "Cleared",
      description: "All patterns cleared",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Practice not found.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/lesson/${lessonId}/practices`)}
            className="mt-4"
          >
            Back to Practices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/lesson/${lessonId}/practice/${practiceId}`)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{practice.title}</h1>
            <p className="text-muted-foreground">{practice.practice_type?.title}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Tempo Controls */}
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeBpm(-5)}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 px-3">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-2xl font-bold text-foreground mx-3">
                    {bpm}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => changeBpm(5)}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Play Controls */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-12 w-12 bg-primary/10 hover:bg-primary/20"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-primary" />
                ) : (
                  <Play className="h-6 w-6 text-primary" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={reset}
                className="h-12 w-12"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-lg">
              Follow the pattern and play along
            </p>
          </div>

          {/* Drum Grid */}
          <DrumGrid
            pattern={pattern}
            currentStep={currentStep}
            onStepToggle={toggleStep}
            onClearPattern={clearPattern}
            metronomeEnabled={metronomeEnabled}
            onMetronomeToggle={() => setMetronomeEnabled(!metronomeEnabled)}
          />
        </div>
      </div>
    </div>
  );
};