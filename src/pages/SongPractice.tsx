import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, ArrowRight } from "lucide-react";
import { TopToolbar } from "@/components/TopToolbar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DrumGrid } from "@/components/DrumGrid";
import { AudioEngine } from "@/utils/audioEngine";
import { DrumPattern, PatternComplexity, createEmptyPattern } from "@/types/drumPatterns";
import { parseCSVNotation } from "@/utils/csvParser";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { NotationView } from "@/components/NotationView";
import { SongTimeDisplay } from "@/components/SongTimeDisplay";
import { useSongPractices } from "@/hooks/useSongPractices";
import { useIsLandscape } from "@/hooks/useIsLandscape";
import { cn } from "@/lib/utils";

const SongPractice = () => {
  const { songId, practiceId } = useParams();
  const navigate = useNavigate();
  const isLandscape = useIsLandscape();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [bpm, setBpm] = useState(60);
  const [targetBpm, setTargetBpm] = useState(120);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [drumSoundEnabled, setDrumSoundEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [metronomeVolume, setMetronomeVolume] = useState(0.5);
  const [drumVolume, setDrumVolume] = useState(0.8);
  const [audioVolume, setAudioVolume] = useState(0.6);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [drumPattern, setDrumPattern] = useState<DrumPattern>(createEmptyPattern(16));
  const [complexity, setComplexity] = useState<PatternComplexity>({
    hasEighthNotes: true,
    hasSixteenthNotes: false,
    hasOpenHats: false,
    hasVelocityVariation: false,
    maxSteps: 16
  });
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [countdown, setCountdown] = useState<number | string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const hasCompletedRef = useRef(false);
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const startTimeRef = useRef<number>(0);

  // Auto-hide controls in landscape mode after 3 seconds of inactivity
  const resetControlsTimeout = useCallback(() => {
    if (!isLandscape) return;
    
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [isLandscape]);

  // Set up touch/click listeners for showing controls
  useEffect(() => {
    if (!isLandscape) {
      setShowControls(true);
      return;
    }

    const handleInteraction = () => {
      resetControlsTimeout();
    };

    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('touchmove', handleInteraction);
    window.addEventListener('click', handleInteraction);

    // Initial timeout
    resetControlsTimeout();

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('touchmove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isLandscape, resetControlsTimeout]);

  // Fetch song data
  const { data: song, isLoading } = useQuery({
    queryKey: ["song", songId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", songId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!songId,
  });

  // Fetch practice data
  const { data: practice } = useQuery({
    queryKey: ["practice", practiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practices")
        .select("*")
        .eq("id", practiceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!practiceId,
  });

  // Fetch all practices for this song to enable navigation
  const { data: songPractices } = useSongPractices(songId || "");

  // Initialize audio engine
  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.close();
      }
    };
  }, []);

  // Load drum pattern from CSV
  useEffect(() => {
    const loadPattern = async () => {
      // Use practice CSV if on practice page, otherwise use song CSV
      const csvUrl = practiceId ? practice?.chords_file_url : song?.notation_file_url;
      
      if (!csvUrl) return;

      try {
        const { pattern, complexity: patternComplexity, bpm: csvBpm } = await parseCSVNotation(csvUrl);
        setDrumPattern(pattern);
        setComplexity(patternComplexity);
        if (csvBpm) setBpm(csvBpm);
      } catch (error) {
        console.error("Error loading drum pattern:", error);
      }
    };

    loadPattern();
  }, [song?.notation_file_url, practice?.chords_file_url, practiceId]);

  // Load audio file (only for song preview, not for practice pages)
  useEffect(() => {
    const loadAudio = async () => {
      if (!song?.audio_file_url || !audioEngineRef.current || practiceId) return;

      try {
        await audioEngineRef.current.loadAudioFile(song.audio_file_url);
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    loadAudio();
  }, [song?.audio_file_url, practiceId]);

  // Set target BPM and initial BPM
  useEffect(() => {
    // Priority 1: Practice tempo determines target BPM
    if (practice?.tempo) {
      const tempoMatch = practice.tempo.match(/\d+/);
      if (tempoMatch) {
        const parsedTempo = parseInt(tempoMatch[0], 10);
        if (parsedTempo >= 60 && parsedTempo <= 240) {
          setTargetBpm(parsedTempo);
        }
      }
    } 
    // Priority 2: Song BPM determines target BPM
    else if (song?.bpm) {
      setTargetBpm(song.bpm);
    }

    // Initialize current BPM:
    // - Practice pages start at 60 BPM
    // - Song preview starts at song BPM (if available)
    if (practiceId) {
      setBpm(60);
    } else if (song?.bpm) {
      setBpm(song.bpm);
    } else {
      setBpm(60);
    }
  }, [song?.bpm, practice?.tempo, practiceId]);

  // Playback interval
  useEffect(() => {
    if (isPlaying) {
      // Calculate step duration based on BPM
      // At 120 BPM: 1 quarter note = 500ms
      // For 16th notes: 60000 / bpm / 4 = 125ms per step
      // For 8th notes: 60000 / bpm / 2 = 250ms per step
      const stepDuration = 60000 / bpm / (complexity.hasSixteenthNotes ? 4 : 2);
      
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          
          // If on practice page and pattern completed, stop and show dialog
          if (practiceId && next >= complexity.maxSteps && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            setIsPlaying(false);
            setShowCompletionDialog(true);
            setScrollOffset(0); // Reset scroll
            return 0; // Reset to start
          }
          
          // Update scroll offset: playhead moves for steps 0-4, then grid scrolls continuously
          if (next >= 5) {
            setScrollOffset(next - 4); // Shows steps (currentStep-4) through (currentStep+15)
          } else {
            setScrollOffset(0); // Show steps 0-19
          }
          
          return next % complexity.maxSteps;
        });
      }, stepDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, complexity.maxSteps, practiceId]);

  // Update volume controls
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setMetronomeVolume(metronomeVolume);
      audioEngineRef.current.setDrumVolume(drumVolume);
      audioEngineRef.current.setBackingTrackVolume(audioVolume);
    }
  }, [metronomeVolume, drumVolume, audioVolume]);

  // Play drum sounds
  useEffect(() => {
    if (!isPlaying || !audioEngineRef.current) return;

    const playDrums = () => {
      if (drumSoundEnabled) {
        Object.entries(drumPattern).forEach(([drum, notes]) => {
          const note = notes[currentStep];
          if (note?.active && audioEngineRef.current) {
            const isOpen = 'open' in note ? note.open : false;
            audioEngineRef.current.playDrumSound(drum, note.velocity, isOpen);
          }
        });
      }

      // Play metronome only on main beats (quarter notes)
      // For 16th notes: play every 4 steps (0, 4, 8, 12...)
      // For 8th notes: play every 2 steps (0, 2, 4, 6...)
      if (metronomeEnabled && audioEngineRef.current) {
        const stepsPerBeat = complexity.hasSixteenthNotes ? 4 : 2;
        if (currentStep % stepsPerBeat === 0) {
          audioEngineRef.current.playMetronome();
        }
      }
    };

    playDrums();
  }, [currentStep, isPlaying, drumPattern, metronomeEnabled, drumSoundEnabled, complexity.hasSixteenthNotes]);

  const startCountdown = () => {
    setCountdown(3);
    
    const countdownSequence = [3, 2, 1, "Go!"];
    let currentIndex = 0;
    
    const runCountdown = () => {
      if (currentIndex < countdownSequence.length) {
        setCountdown(countdownSequence[currentIndex]);
        currentIndex++;
        countdownTimeoutRef.current = setTimeout(runCountdown, 1000);
      } else {
        setCountdown(null);
        actuallyStartPlayback();
      }
    };
    
    runCountdown();
  };

  const actuallyStartPlayback = async () => {
    if (audioEngineRef.current) {
      await audioEngineRef.current.resumeContext();
      startTimeRef.current = Date.now();
      if (audioEnabled) {
        audioEngineRef.current.playBackingTrack();
      }
    }
    setIsPlaying(true);
  };

  const togglePlayback = async () => {
    // Clear any existing countdown
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      setCountdown(null);
    }

    if (audioEngineRef.current) {
      await audioEngineRef.current.resumeContext();
      
      if (!isPlaying) {
        // Start countdown instead of immediately playing
        startCountdown();
      } else {
        audioEngineRef.current.pauseBackingTrack();
        setIsPlaying(false);
      }
    }
  };

  const handleReset = () => {
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
    }
    setCountdown(null);
    setIsPlaying(false);
    setCurrentStep(0);
    setScrollOffset(0);
    startTimeRef.current = 0;
    hasCompletedRef.current = false;
    if (audioEngineRef.current) {
      audioEngineRef.current.stopBackingTrack();
    }
  };

  const handleRepeatSection = () => {
    setShowCompletionDialog(false);
    hasCompletedRef.current = false;
    setCurrentStep(0);
    setScrollOffset(0);
    startCountdown();
  };

  const handleNextSection = () => {
    if (!songPractices || !practiceId) return;
    
    const currentIndex = songPractices.practices.findIndex(p => p.id === practiceId);
    const nextPractice = songPractices.practices[currentIndex + 1];
    
    if (nextPractice) {
      navigate(`/song/${songId}/practice/${nextPractice.id}`);
      setShowCompletionDialog(false);
      hasCompletedRef.current = false;
      setCurrentStep(0);
      setScrollOffset(0);
    }
  };

  const handleSeek = (step: number) => {
    setCurrentStep(step);
    const stepDuration = 60000 / bpm / (complexity.hasSixteenthNotes ? 4 : 2);
    const timeInSeconds = (step * stepDuration) / 1000;
    
    if (audioEngineRef.current) {
      audioEngineRef.current.seekBackingTrack(timeInSeconds);
      if (isPlaying && audioEnabled) {
        audioEngineRef.current.playBackingTrack();
      }
    }
    
    startTimeRef.current = Date.now() - (step * stepDuration);
  };

  const handleStepToggle = (drum: string, step: number) => {
    setDrumPattern(prev => {
      const drumSteps = prev[drum];
      if (!Array.isArray(drumSteps)) return prev;
      
      return {
        ...prev,
        [drum]: drumSteps.map((note, i) => 
          i === step 
            ? { ...note, active: !note.active }
            : note
        )
      };
    });
  };

  const handleClearPattern = () => {
    setDrumPattern(createEmptyPattern(complexity.maxSteps));
  };

  // Calculate sections from pattern
  const sections = drumPattern.sections
    ? drumPattern.sections.reduce((acc: { name: string; startStep: number; endStep: number }[], section, index) => {
        if (section && (acc.length === 0 || acc[acc.length - 1].name !== section)) {
          if (acc.length > 0) {
            acc[acc.length - 1].endStep = index - 1;
          }
          acc.push({ name: section, startStep: index, endStep: complexity.maxSteps - 1 });
        }
        return acc;
      }, [])
    : [];

  // Calculate current time and total time
  const stepDuration = 60000 / bpm / (complexity.hasSixteenthNotes ? 4 : 2);
  const currentTime = currentStep * stepDuration;
  // Use audio file duration if available, otherwise calculate from pattern
  const totalTime = audioEngineRef.current 
    ? (audioEngineRef.current.getBackingTrackDuration() * 1000) || (complexity.maxSteps * stepDuration)
    : complexity.maxSteps * stepDuration;

  // Toggle audio playback (disabled for practice pages)
  useEffect(() => {
    if (!audioEngineRef.current || practiceId) return;
    
    if (isPlaying && audioEnabled) {
      audioEngineRef.current.playBackingTrack();
    } else {
      audioEngineRef.current.pauseBackingTrack();
    }
  }, [audioEnabled, isPlaying, practiceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Song not found</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-background",
      isLandscape ? "h-screen overflow-hidden" : "min-h-screen pb-32"
    )}>
      {/* Portrait: Sticky top toolbar */}
      {!isLandscape && (
        <div className="sticky top-0 z-10 p-2">
          <TopToolbar
            title={practice ? practice.title : song.title}
            currentSection={drumPattern.sections?.[currentStep] || practice?.title || "Section"}
            isPlaying={isPlaying}
            isLandscape={isLandscape}
            onPlayPause={togglePlayback}
            onRestart={handleReset}
            onExit={() => navigate(`/song/${songId}`)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        isLandscape 
          ? "h-full px-2 py-1 flex flex-col" 
          : "container px-4 py-6 pb-24 space-y-6"
      )}>
        {/* Landscape: Top toolbar above grid */}
        {isLandscape && (
          <div className={cn(
            "transition-transform duration-300 ease-out z-50 px-1 mb-2",
            !showControls && "-translate-y-[calc(100%+8px)] absolute top-0 left-0 right-0"
          )}>
            <TopToolbar
              title={practice ? practice.title : song.title}
              currentSection={drumPattern.sections?.[currentStep] || practice?.title || "Section"}
              isPlaying={isPlaying}
              isLandscape={isLandscape}
              onPlayPause={togglePlayback}
              onRestart={handleReset}
              onExit={() => navigate(`/song/${songId}`)}
            />
          </div>
        )}

        {/* View: Grid or Notation */}
        <div className={cn(
          "relative",
          isLandscape && "flex-1 mb-12"
        )}>
          {viewMode === 'grid' ? (
            <DrumGrid
              pattern={drumPattern}
              currentStep={currentStep}
              scrollOffset={scrollOffset}
              onStepToggle={handleStepToggle}
              onClearPattern={handleClearPattern}
              onMetronomeToggle={() => setMetronomeEnabled(!metronomeEnabled)}
              metronomeEnabled={metronomeEnabled}
              onTogglePlay={togglePlayback}
              isPlaying={isPlaying}
              complexity={complexity}
              isLandscape={isLandscape}
            />
          ) : (
            <NotationView
              pattern={drumPattern}
              currentStep={currentStep}
              scrollOffset={scrollOffset}
              complexity={complexity}
            />
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm z-50 rounded-lg">
              <div className={cn(
                "relative flex items-center justify-center",
                isLandscape ? "w-24 h-24" : "w-48 h-48"
              )}>
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                <div className={cn(
                  "relative rounded-full bg-primary flex items-center justify-center shadow-2xl",
                  isLandscape ? "w-20 h-20" : "w-40 h-40"
                )}>
                  <span className={cn(
                    "font-bold text-white",
                    isLandscape ? "text-4xl" : "text-7xl"
                  )}>
                    {countdown}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Toolbar - slides down when hidden in landscape */}
      <div className={cn(
        "transition-transform duration-300 ease-out",
        isLandscape && "fixed bottom-1 left-1 right-1 z-50",
        isLandscape && !showControls && "translate-y-[calc(100%+8px)]",
        !isLandscape && "fixed bottom-0 left-0 right-0 z-20"
      )}>
        <BottomToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          metronomeEnabled={metronomeEnabled}
          drumSoundEnabled={drumSoundEnabled}
          audioEnabled={audioEnabled}
          onMetronomeToggle={() => setMetronomeEnabled(!metronomeEnabled)}
          onDrumSoundToggle={() => setDrumSoundEnabled(!drumSoundEnabled)}
          onAudioToggle={() => setAudioEnabled(!audioEnabled)}
          currentTime={currentTime}
          totalTime={totalTime}
          bpm={bpm}
          targetBpm={targetBpm}
          onBpmDecrease={() => setBpm(Math.max(60, bpm - 5))}
          onBpmIncrease={() => setBpm(Math.min(targetBpm, bpm + 5))}
          showAudioControl={!practiceId}
          isLandscape={isLandscape}
        />
      </div>

      {/* Completion Dialog */}
      <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Practice Complete!</AlertDialogTitle>
            <AlertDialogDescription>
              Great job! What would you like to do next?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleRepeatSection}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Repeat Section
            </Button>
            <Button
              onClick={handleNextSection}
              className="w-full sm:w-auto"
              disabled={!songPractices || !practiceId || 
                songPractices.practices.findIndex(p => p.id === practiceId) === songPractices.practices.length - 1}
            >
              Next Section
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SongPractice;
