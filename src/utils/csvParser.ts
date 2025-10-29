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

  // Check CSV format type
  const hasCountColumn = headers.some(h => h.toLowerCase() === 'count');
  const hasInstrumentColumns = headers.some(h => h.toLowerCase().includes('instrument'));
  
  if (hasCountColumn && hasInstrumentColumns) {
    // New format: Count, Instrument 1, Instrument 2, Section
    return parseSubdivisionFormat(rows, headers);
  } else {
    // Original format: columns for each beat
    return parseColumnFormat(rows, headers);
  }
};

const parseSubdivisionFormat = (rows: CSVRow[], headers: string[]): { pattern: DrumPattern; complexity: PatternComplexity; bpm?: number } => {
  // Count total steps from Count column (1, e, &, a pattern = 16th notes)
  const totalSteps = rows.length;
  const maxSteps = totalSteps > 64 ? 128 : totalSteps > 32 ? 64 : 32; // Support up to 128 steps
  
  const complexity: PatternComplexity = {
    hasEighthNotes: maxSteps >= 16,
    hasSixteenthNotes: maxSteps >= 32,
    hasVelocityVariation: false,
    hasOpenHats: false,
    maxSteps
  };

  const pattern = createEmptyPattern(maxSteps);
  let bpm: number | undefined;
  let stepIndex = 0;

  rows.forEach((row, index) => {
    if (stepIndex >= maxSteps) return;

    // Process Instrument 1
    const instrument1 = row['Instrument 1'] || row['instrument 1'] || '';
    if (instrument1) {
      processInstrument(instrument1, pattern, stepIndex, complexity);
    }

    // Process Instrument 2
    const instrument2 = row['Instrument 2'] || row['instrument 2'] || '';
    if (instrument2) {
      processInstrument(instrument2, pattern, stepIndex, complexity);
    }

    stepIndex++;
  });

  return { pattern, complexity, bpm };
};

const processInstrument = (instrumentName: string, pattern: DrumPattern, stepIndex: number, complexity: PatternComplexity) => {
  const inst = instrumentName.toLowerCase().trim();
  if (!inst) return;

  let patternKey: keyof DrumPattern | null = null;
  let velocity = 0.7;
  let type: 'normal' | 'ghost' | 'accent' = 'normal';
  let isOpen = false;

  // Map instrument names to pattern keys
  if (inst.includes('bass drum') || inst.includes('kick')) {
    patternKey = 'kick';
  } else if (inst.includes('snare')) {
    patternKey = 'snare';
  } else if (inst.includes('tom')) {
    patternKey = 'kick'; // Use kick for tom-tom for now
    velocity = 0.8;
  } else if (inst.includes('hi-hat') || inst.includes('hihat')) {
    if (inst.includes('open')) {
      patternKey = 'openhat';
      isOpen = true;
      complexity.hasOpenHats = true;
    } else {
      patternKey = 'hihat';
      isOpen = false;
    }
  }

  // Check for ghost notes
  if (inst.includes('ghost')) {
    velocity = 0.3;
    type = 'ghost';
    complexity.hasVelocityVariation = true;
    // Ghost notes typically on snare
    if (!patternKey) patternKey = 'snare';
  }

  if (!patternKey || !pattern[patternKey] || stepIndex >= pattern[patternKey].length) return;

  const note: DrumNote | HiHatNote = {
    active: true,
    velocity,
    type
  };

  if (patternKey === 'hihat' || patternKey === 'openhat') {
    (note as HiHatNote).open = isOpen;
  }

  pattern[patternKey][stepIndex] = note;
};

const parseColumnFormat = (rows: CSVRow[], headers: string[]): { pattern: DrumPattern; complexity: PatternComplexity; bpm?: number } => {
  // Original format handling
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

  rows.forEach(row => {
    const instrument = row['Instrument']?.toLowerCase() || row['instrument']?.toLowerCase();
    
    if (row['BPM'] || row['bpm']) {
      const bpmValue = parseInt(row['BPM'] || row['bpm']);
      if (!isNaN(bpmValue)) {
        bpm = bpmValue;
      }
    }

    if (!instrument) return;

    let patternKey: keyof DrumPattern | null = null;
    if (instrument.includes('kick') || instrument.includes('bass')) {
      patternKey = 'kick';
    } else if (instrument.includes('snare')) {
      patternKey = 'snare';
    } else if (instrument.includes('hat') || instrument.includes('hi-hat') || instrument.includes('hihat')) {
      patternKey = instrument.includes('open') ? 'openhat' : 'hihat';
    }

    if (!patternKey || !pattern[patternKey]) return;

    headers.forEach((header, index) => {
      if (header.toLowerCase().includes('beat') || header.toLowerCase().includes('step')) {
        const stepMatch = header.match(/\d+/);
        if (stepMatch) {
          const stepNumber = parseInt(stepMatch[0]) - 1;
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
