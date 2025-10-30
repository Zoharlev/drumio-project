import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, Pause, RotateCcw } from "lucide-react";
import { DrumGrid } from "@/components/DrumGrid";
import { AudioEngine } from "@/utils/audioEngine";
import { DrumPattern, PatternComplexity, createEmptyPattern } from "@/types/drumPatterns";
import { parseCSVNotation } from "@/utils/csvParser";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { NotationView } from "@/components/NotationView";
import { SongTimeDisplay } from "@/components/SongTimeDisplay";

const SongPractice = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const startTimeRef = useRef<number>(0);

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
      if (!song?.notation_file_url) return;

      try {
        const { pattern, complexity: patternComplexity, bpm: csvBpm } = await parseCSVNotation(song.notation_file_url);
        setDrumPattern(pattern);
        setComplexity(patternComplexity);
        if (csvBpm) setBpm(csvBpm);
      } catch (error) {
        console.error("Error loading drum pattern:", error);
      }
    };

    loadPattern();
  }, [song?.notation_file_url]);

  // Load audio file
  useEffect(() => {
    const loadAudio = async () => {
      if (!song?.audio_file_url || !audioEngineRef.current) return;

      try {
        await audioEngineRef.current.loadAudioFile(song.audio_file_url);
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    loadAudio();
  }, [song?.audio_file_url]);

  // Set BPM from song
  useEffect(() => {
    if (song?.bpm) {
      setBpm(song.bpm);
    }
  }, [song?.bpm]);

  // Playback interval
  useEffect(() => {
    if (isPlaying) {
      // Calculate step duration based on BPM
      // For 16th notes (32 steps): 60000 / bpm / 8
      // For 8th notes (16 steps): 60000 / bpm / 4
      const stepDuration = 60000 / bpm / (complexity.hasSixteenthNotes ? 8 : 4);
      
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % complexity.maxSteps);
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
  }, [isPlaying, bpm, complexity.maxSteps]);

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

      if (metronomeEnabled && audioEngineRef.current) {
        audioEngineRef.current.playMetronome();
      }
    };

    playDrums();
  }, [currentStep, isPlaying, drumPattern, metronomeEnabled, drumSoundEnabled]);

  const togglePlayback = async () => {
    if (audioEngineRef.current) {
      await audioEngineRef.current.resumeContext();
      
      if (!isPlaying) {
        startTimeRef.current = Date.now();
        if (audioEnabled) {
          audioEngineRef.current.playBackingTrack();
        }
      } else {
        audioEngineRef.current.pauseBackingTrack();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    startTimeRef.current = 0;
    if (audioEngineRef.current) {
      audioEngineRef.current.stopBackingTrack();
    }
  };

  const handleSeek = (step: number) => {
    setCurrentStep(step);
    const stepDuration = 60000 / bpm / (complexity.hasSixteenthNotes ? 8 : 4);
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
  const stepDuration = 60000 / bpm / (complexity.hasSixteenthNotes ? 8 : 4);
  const currentTime = currentStep * stepDuration;
  const totalTime = complexity.maxSteps * stepDuration;

  // Toggle audio playback
  useEffect(() => {
    if (!audioEngineRef.current) return;
    
    if (isPlaying && audioEnabled) {
      audioEngineRef.current.playBackingTrack();
    } else {
      audioEngineRef.current.pauseBackingTrack();
    }
  }, [audioEnabled, isPlaying]);

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
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/explore")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-foreground font-poppins">
              {song.title}
            </h1>
          </div>
          
          <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Controls */}
      <div className="container px-4 py-6 space-y-6">
        {/* Song Time Display */}
        <SongTimeDisplay
          currentTime={currentTime}
          totalTime={totalTime}
          sections={sections}
          currentStep={currentStep}
          maxSteps={complexity.maxSteps}
          onSeek={handleSeek}
        />

        {/* Tempo Control */}
        <div className="flex items-center justify-between bg-card rounded-lg p-4">
          <span className="text-sm font-medium text-muted-foreground">Tempo</span>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBpm(Math.max(40, bpm - 5))}
            >
              -
            </Button>
            <span className="text-2xl font-bold text-foreground w-16 text-center">
              {bpm}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBpm(Math.min(240, bpm + 5))}
            >
              +
            </Button>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className="h-12 w-12"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          <Button
            size="lg"
            onClick={togglePlayback}
            className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 animate-pulse-slow"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" fill="currentColor" />
            ) : (
              <Play className="h-8 w-8" fill="currentColor" />
            )}
          </Button>
        </div>

        {/* View: Grid or Notation */}
        {viewMode === 'grid' ? (
          <DrumGrid
            pattern={drumPattern}
            currentStep={currentStep}
            onStepToggle={handleStepToggle}
            onClearPattern={handleClearPattern}
            onMetronomeToggle={() => setMetronomeEnabled(!metronomeEnabled)}
            metronomeEnabled={metronomeEnabled}
            onTogglePlay={togglePlayback}
            isPlaying={isPlaying}
            complexity={complexity}
          />
        ) : (
          <NotationView
            pattern={drumPattern}
            currentStep={currentStep}
            complexity={complexity}
          />
        )}
      </div>

      {/* Bottom Toolbar */}
      <BottomToolbar
        metronomeEnabled={metronomeEnabled}
        drumSoundEnabled={drumSoundEnabled}
        audioEnabled={audioEnabled}
        onMetronomeToggle={() => setMetronomeEnabled(!metronomeEnabled)}
        onDrumSoundToggle={() => setDrumSoundEnabled(!drumSoundEnabled)}
        onAudioToggle={() => setAudioEnabled(!audioEnabled)}
        metronomeVolume={metronomeVolume}
        drumVolume={drumVolume}
        audioVolume={audioVolume}
        onMetronomeVolumeChange={setMetronomeVolume}
        onDrumVolumeChange={setDrumVolume}
        onAudioVolumeChange={setAudioVolume}
      />
    </div>
  );
};

export default SongPractice;
