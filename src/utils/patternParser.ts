import { DrumPattern, DrumNote, HiHatNote, PatternComplexity, createEmptyPattern } from '@/types/drumPatterns';

export const parsePatternFromNotes = (practiceNotes: string): { pattern: DrumPattern; complexity: PatternComplexity } => {
  const lines = practiceNotes.split('\n');
  
  // Analyze complexity first
  const complexity: PatternComplexity = {
    hasEighthNotes: false,
    hasSixteenthNotes: false,
    hasVelocityVariation: false,
    hasOpenHats: false,
    maxSteps: 16
  };

  // Check for complexity indicators
  const hasDetailedNotation = practiceNotes.includes('(') || practiceNotes.includes('o') || practiceNotes.includes('O');
  const hasGhostNotes = practiceNotes.includes('o') || practiceNotes.includes('(');
  const hasAccents = practiceNotes.includes('X') && practiceNotes.includes('x');
  
  if (hasDetailedNotation) {
    complexity.hasSixteenthNotes = true;
    complexity.maxSteps = 32;
  } else {
    complexity.hasEighthNotes = true;
    complexity.maxSteps = 16;
  }
  
  complexity.hasVelocityVariation = hasGhostNotes || hasAccents;
  complexity.hasOpenHats = practiceNotes.includes('O');

  const pattern = createEmptyPattern(complexity.maxSteps);

  lines.forEach((line: string) => {
    if (line.startsWith('Hi-Hat,') || line.startsWith('Kick,') || line.startsWith('Snare,')) {
      const parts = line.split(',');
      const drumType = parts[0].toLowerCase();
      
      // Map drum names to pattern keys
      let patternKey: keyof DrumPattern | null = null;
      if (drumType === 'hi-hat') patternKey = 'hihat';
      else if (drumType === 'kick') patternKey = 'kick';
      else if (drumType === 'snare') patternKey = 'snare';

      if (patternKey && pattern[patternKey]) {
        // Parse each beat
        for (let i = 1; i < Math.min(parts.length, 9); i++) { // 8 beats max
          const beatNotation = parts[i]?.trim();
          if (!beatNotation) continue;

          const baseIndex = (i - 1) * (complexity.maxSteps / 8); // Distribute across available steps
          
          // Parse beat notation (e.g., "X", "x", "o", "(x)", "X-o", etc.)
          if (complexity.hasSixteenthNotes) {
            parseDetailedNotation(beatNotation, pattern[patternKey], baseIndex, complexity);
          } else {
            parseSimpleNotation(beatNotation, pattern[patternKey], baseIndex);
          }
        }
      }
    }
  });

  return { pattern, complexity };
};

const parseSimpleNotation = (notation: string, track: DrumNote[] | HiHatNote[], baseIndex: number) => {
  if (notation === 'X' && baseIndex < track.length) {
    track[baseIndex] = { active: true, velocity: 1.0, type: 'accent' };
  } else if (notation === 'x' && baseIndex < track.length) {
    track[baseIndex] = { active: true, velocity: 0.7, type: 'normal' };
  }
};

const parseDetailedNotation = (notation: string, track: DrumNote[] | HiHatNote[], baseIndex: number, complexity: PatternComplexity) => {
  // Handle complex notation like "X-o-x-o" for 16th note subdivisions
  const subdivisions = notation.split('-');
  
  subdivisions.forEach((note, subIndex) => {
    const stepIndex = baseIndex + subIndex;
    if (stepIndex >= track.length) return;

    const velocity = getVelocityFromNotation(note);
    const isOpen = note.includes('O');
    
    if (note.includes('X') || note.includes('x') || note.includes('o') || note.includes('O')) {
      const noteData: DrumNote | HiHatNote = {
        active: true,
        velocity,
        type: getTypeFromNotation(note)
      };

      // Add open/closed info for hi-hats
      if ('open' in track[0]) {
        (noteData as HiHatNote).open = isOpen;
        if (isOpen) complexity.hasOpenHats = true;
      }

      track[stepIndex] = noteData;
    }
  });
};

const getVelocityFromNotation = (note: string): number => {
  if (note.includes('(') || note === 'o') return 0.3; // Ghost note
  if (note === 'X' || note === 'O') return 1.0; // Accent
  return 0.7; // Normal
};

const getTypeFromNotation = (note: string): 'normal' | 'ghost' | 'accent' => {
  if (note.includes('(') || note === 'o') return 'ghost';
  if (note === 'X' || note === 'O') return 'accent';
  return 'normal';
};