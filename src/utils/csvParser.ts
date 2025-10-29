import { DrumPattern, DrumNote, HiHatNote, PatternComplexity, createEmptyPattern } from '@/types/drumPatterns';

interface CSVRow {
  [key: string]: string;
}

export const parseCSVNotation = async (csvUrl: string): Promise<{ pattern: DrumPattern; complexity: PatternComplexity; bpm?: number }> => {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    return parseCSVText(csvText);
  } catch (error) {
    console.error('Error loading CSV file:', error);
    throw error;
  }
};

export const parseCSVText = (csvText: string): { pattern: DrumPattern; complexity: PatternComplexity; bpm?: number } => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  // Determine pattern length and complexity
  const maxSteps = determineMaxSteps(rows, headers);
  const complexity: PatternComplexity = {
    hasEighthNotes: maxSteps >= 16,
    hasSixteenthNotes: maxSteps >= 32,
    hasVelocityVariation: false,
    hasOpenHats: false,
    maxSteps
  };

  const pattern = createEmptyPattern(maxSteps);
  let bpm: number | undefined;

  // Parse each row
  rows.forEach(row => {
    const instrument = row['Instrument']?.toLowerCase() || row['instrument']?.toLowerCase();
    
    // Check for BPM in the CSV
    if (row['BPM'] || row['bpm']) {
      const bpmValue = parseInt(row['BPM'] || row['bpm']);
      if (!isNaN(bpmValue)) {
        bpm = bpmValue;
      }
    }

    if (!instrument) return;

    // Map instrument names to pattern keys
    let patternKey: keyof DrumPattern | null = null;
    if (instrument.includes('kick') || instrument.includes('bass')) {
      patternKey = 'kick';
    } else if (instrument.includes('snare')) {
      patternKey = 'snare';
    } else if (instrument.includes('hat') || instrument.includes('hi-hat') || instrument.includes('hihat')) {
      patternKey = instrument.includes('open') ? 'openhat' : 'hihat';
    }

    if (!patternKey || !pattern[patternKey]) return;

    // Parse note columns (assuming columns like "Beat1", "Beat2", etc., or "Step1", "Step2", etc.)
    headers.forEach((header, index) => {
      if (header.toLowerCase().includes('beat') || header.toLowerCase().includes('step')) {
        const stepMatch = header.match(/\d+/);
        if (stepMatch) {
          const stepNumber = parseInt(stepMatch[0]) - 1; // 0-indexed
          if (stepNumber >= 0 && stepNumber < maxSteps) {
            const noteValue = row[header];
            if (noteValue) {
              const note = parseNoteValue(noteValue, patternKey === 'hihat' || patternKey === 'openhat');
              if (note) {
                pattern[patternKey][stepNumber] = note;
                if (note.velocity !== 0.7) {
                  complexity.hasVelocityVariation = true;
                }
                if ('open' in note && note.open) {
                  complexity.hasOpenHats = true;
                }
              }
            }
          }
        }
      }
    });
  });

  return { pattern, complexity, bpm };
};

const determineMaxSteps = (rows: CSVRow[], headers: string[]): number => {
  let maxStep = 16; // Default to 16 steps
  
  headers.forEach(header => {
    if (header.toLowerCase().includes('beat') || header.toLowerCase().includes('step')) {
      const stepMatch = header.match(/\d+/);
      if (stepMatch) {
        const stepNumber = parseInt(stepMatch[0]);
        maxStep = Math.max(maxStep, stepNumber);
      }
    }
  });

  // Round up to next power of 2 or common division (8, 16, 32)
  if (maxStep <= 8) return 8;
  if (maxStep <= 16) return 16;
  return 32;
};

const parseNoteValue = (value: string, isHiHat: boolean): DrumNote | HiHatNote | null => {
  const val = value.toLowerCase().trim();
  
  if (!val || val === '0' || val === '-' || val === '') {
    return null;
  }

  let velocity = 0.7;
  let type: 'normal' | 'ghost' | 'accent' = 'normal';
  let open = false;

  // Parse common notation formats
  if (val === 'x' || val === '1') {
    velocity = 0.7;
    type = 'normal';
  } else if (val === 'x!' || val === 'X' || val.includes('accent')) {
    velocity = 1.0;
    type = 'accent';
  } else if (val === '(x)' || val === 'o' || val.includes('ghost')) {
    velocity = 0.3;
    type = 'ghost';
  } else if (val === 'o!' || val === 'O' || val.includes('open')) {
    velocity = 0.7;
    open = true;
  } else if (!isNaN(parseFloat(val))) {
    // Numeric velocity (0-1 or 0-127 MIDI)
    const numVal = parseFloat(val);
    velocity = numVal > 1 ? numVal / 127 : numVal;
    type = velocity > 0.85 ? 'accent' : velocity < 0.4 ? 'ghost' : 'normal';
  }

  const note: DrumNote | HiHatNote = {
    active: true,
    velocity,
    type
  };

  if (isHiHat) {
    (note as HiHatNote).open = open;
  }

  return note;
};
