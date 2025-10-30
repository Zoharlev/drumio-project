import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Plus, Minus } from "lucide-react";
import { DrumGrid } from "./DrumGrid";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DrumPattern, PatternComplexity, createEmptyPattern } from "@/types/drumPatterns";
import { parsePatternFromNotes } from "@/utils/patternParser";
import { parseCSVNotation } from "@/utils/csvParser";
import { AudioEngine } from "@/utils/audioEngine";

export const PracticeSession = () => {
  const navigate = useNavigate();
  const { practiceId, lessonId, songId } = useParams<{ practiceId: string; lessonId: string; songId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(90);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [pattern, setPattern] = useState<DrumPattern>(createEmptyPattern(16));
  const [complexity, setComplexity] = useState<PatternComplexity>({
    hasEighthNotes: false,
    hasSixteenthNotes: false,
    hasVelocityVariation: false,
    hasOpenHats: false,
    maxSteps: 16
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const { toast } = useToast();

  // Fetch practice data (only when practiceId is provided)
  const { data: practice, isLoading: practiceLoading } = useQuery({
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
    },
    enabled: !!practiceId
  });

  // Fetch song data directly when coming from song route
  const { data: directSongData, isLoading: songLoading } = useQuery({
    queryKey: ["direct-song", songId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", songId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!songId
  });

  // Fetch song data via practice relationships (when practiceId is provided)
  const { data: linkedSongData } = useQuery({
    queryKey: ["practice-song", practiceId],
    queryFn: async () => {
      // First get the song_id from song_practices
      const { data: practiceData, error: practiceError } = await supabase
        .from("song_practices")
        .select("song_id")
        .eq("practice_id", practiceId)
        .maybeSingle();
      
      if (practiceError || !practiceData) {
        console.log('No song linked to this practice');
        return null;
      }

      // Then get the song data
      const { data: song, error: songError } = await supabase
        .from("songs")
        .select("*")
        .eq("id", practiceData.song_id)
        .maybeSingle();
      
      if (songError) throw songError;
      return song;
    },
    enabled: !!practiceId
  });

  // Use direct song data if available, otherwise use linked song data
  const songData = directSongData || linkedSongData;
  const isLoading = practiceLoading || songLoading;

  // Initialize audio engine
  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    return () => {
      audioEngineRef.current?.close();
    };
  }, []);

  // Load pattern from CSV notation file or practice notes
  useEffect(() => {
    const loadPattern = async () => {
      // Priority 1: Load from song's notation_file_url if available
      if (songData?.notation_file_url) {
        console.log('Loading CSV from:', songData.notation_file_url);
        try {
          const { pattern: parsedPattern, complexity: parsedComplexity, bpm: csvBpm } = await parseCSVNotation(songData.notation_file_url);
          console.log('CSV parsed successfully:', { 
            patternLength: parsedPattern.length, 
            complexity: parsedComplexity,
            subdivisions: parsedPattern.subdivisions?.length 
          });
          setPattern(parsedPattern);
          setComplexity(parsedComplexity);
          if (csvBpm) {
            setBpm(csvBpm);
          }
          toast({
            title: "Pattern loaded",
            description: `Loaded ${parsedPattern.length} steps from CSV`,
          });
          return;
        } catch (error) {
          console.error('Error loading CSV notation:', error);
          toast({
            title: "CSV load failed",
            description: error instanceof Error ? error.message : "Unknown error",
            variant: "destructive",
          });
        }
      }

      // Priority 2: Parse from practice_note field
      if ((practice as any)?.practice_note) {
        try {
          const { pattern: parsedPattern, complexity: parsedComplexity } = parsePatternFromNotes((practice as any).practice_note);
          setPattern(parsedPattern);
          setComplexity(parsedComplexity);
        } catch (error) {
          console.error('Error parsing practice notes:', error);
          // Fallback to basic pattern
          const fallbackPattern = createEmptyPattern(16);
          fallbackPattern.kick[0] = { active: true, velocity: 0.7, type: 'normal' };
          fallbackPattern.kick[8] = { active: true, velocity: 0.7, type: 'normal' };
          fallbackPattern.snare[4] = { active: true, velocity: 0.7, type: 'normal' };
          fallbackPattern.snare[12] = { active: true, velocity: 0.7, type: 'normal' };
          fallbackPattern.hihat[0] = { active: true, velocity: 0.7, type: 'normal', open: false };
          fallbackPattern.hihat[4] = { active: true, velocity: 0.7, type: 'normal', open: false };
          fallbackPattern.hihat[8] = { active: true, velocity: 0.7, type: 'normal', open: false };
          fallbackPattern.hihat[12] = { active: true, velocity: 0.7, type: 'normal', open: false };
          
          setPattern(fallbackPattern);
          setComplexity({
            hasEighthNotes: true,
            hasSixteenthNotes: false,
            hasVelocityVariation: false,
            hasOpenHats: false,
            maxSteps: 16
          });
        }
      }
    };

    loadPattern();
  }, [practice, songData, toast]);

  // Load audio file from song data
  useEffect(() => {
    const loadAudio = async () => {
      if (songData?.audio_file_url && audioEngineRef.current) {
        try {
          await audioEngineRef.current.loadAudioFile(songData.audio_file_url);
          toast({
            title: "Audio loaded",
            description: "Song audio file loaded successfully",
          });
        } catch (error) {
          console.error('Error loading audio file:', error);
          toast({
            title: "Audio load failed",
            description: "Using synthesized drum sounds",
            variant: "destructive",
          });
        }
      }
    };

    loadAudio();
  }, [songData, toast]);

  // Set initial BPM from song or practice tempo
  useEffect(() => {
    // Priority 1: BPM from song data
    if (songData?.bpm) {
      setBpm(songData.bpm);
      return;
    }

    // Priority 2: Parse tempo from practice
    if (practice?.tempo) {
      const tempoMatch = practice.tempo.match(/\d+/);
      if (tempoMatch) {
        const parsedTempo = parseInt(tempoMatch[0], 10);
        if (parsedTempo >= 60 && parsedTempo <= 200) {
          setBpm(parsedTempo);
        }
      }
    }
  }, [practice, songData]);

  // Step timing based on BPM and complexity
  // At 120 BPM: 1 quarter note = 500ms
  // For 16th notes: 60000 / bpm / 4 = 125ms per step
  // For 8th notes: 60000 / bpm / 2 = 250ms per step
  const stepDuration = 60000 / bpm / (complexity.hasSixteenthNotes ? 4 : 2);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % complexity.maxSteps;
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
    if (isPlaying && audioEngineRef.current) {
      audioEngineRef.current.resumeContext();
      
      // Play sounds for active notes at current step
      Object.entries(pattern).forEach(([drum, steps]) => {
        const note = steps[currentStep];
        if (note?.active) {
          const velocity = note.velocity || 0.7;
          const isOpen = (note as any).open || false;
          audioEngineRef.current?.playDrumSound(drum, velocity, isOpen);
        }
      });

      // Play metronome only on main beats (quarter notes)
      // For 16th notes: play every 4 steps (0, 4, 8, 12...)
      // For 8th notes: play every 2 steps (0, 2, 4, 6...)
      if (metronomeEnabled && audioEngineRef.current) {
        const stepsPerBeat = complexity.hasSixteenthNotes ? 4 : 2;
        if (currentStep % stepsPerBeat === 0) {
          audioEngineRef.current.playMetronome();
        }
      }
    }
  }, [currentStep, isPlaying, pattern, metronomeEnabled, complexity.hasSixteenthNotes]);


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
    setPattern(prev => {
      const drumSteps = prev[drum];
      if (!Array.isArray(drumSteps)) return prev;
      
      return {
        ...prev,
        [drum]: drumSteps.map((note, index) => {
          if (index === step) {
            if (note.active) {
              return { ...note, active: false };
            } else {
              return { ...note, active: true, velocity: 0.7, type: 'normal' };
            }
          }
          return note;
        })
      };
    });
  };

  const clearPattern = () => {
    setPattern(createEmptyPattern(complexity.maxSteps));
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

  // If coming from song route, we don't need practice data
  if (!songId && !practice) {
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

  // If coming from song route but song not found
  if (songId && !songData && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Song not found.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/explore')}
            className="mt-4"
          >
            Back to Explore
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
            onClick={() => songId ? navigate('/explore') : navigate(`/lesson/${lessonId}/practice/${practiceId}`)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{songId ? songData?.title : practice?.title}</h1>
            <p className="text-muted-foreground">{songId ? songData?.level : practice?.practice_type?.title}</p>
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
            onTogglePlay={togglePlay}
            isPlaying={isPlaying}
            complexity={complexity}
          />
        </div>
      </div>
    </div>
  );
};