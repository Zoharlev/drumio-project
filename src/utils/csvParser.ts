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
  console.log('📄 Parsing CSV text, length:', csvText.length);
  
  const lines = csvText.trim().split('\n');
  console.log('📊 CSV lines:', lines.length);
  
  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  console.log('📋 CSV headers:', headers);
  
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
  console.log('📦 Parsed rows:', rows.length);
  if (rows.length > 0) {
    console.log('🔍 First row sample:', rows[0]);
  }

  // Always use subdivision format (Format 1)
  console.log('✅ Using subdivision format parser');
  return parseSubdivisionFormat(rows, headers);
};

const parseSubdivisionFormat = (rows: CSVRow[], headers: string[]): { pattern: DrumPattern; complexity: PatternComplexity; bpm?: number } => {
  console.log('🎵 parseSubdivisionFormat: Processing', rows.length, 'rows');
  
  if (rows.length === 0) {
    console.warn('⚠️ No rows to process');
    throw new Error('No data rows in CSV');
  }
  
  // Use exact number of rows from CSV as pattern length
  const totalSteps = rows.length;
  const maxSteps = totalSteps;
  
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
  let notesProcessed = 0;
  let lastNoteStep = 0;
  
  // Store subdivisions and sections
  const subdivisions: string[] = [];
  const sections: string[] = [];

  rows.forEach((row, index) => {
    if (stepIndex >= maxSteps) return;

    // Store subdivision (count) and section
    const count = row['Count'] || row['count'] || '';
    const section = row['Section'] || row['section'] || '';
    subdivisions[stepIndex] = count;
    sections[stepIndex] = section;

    // Process Instrument 1
    const instrument1 = row['Instrument 1'] || row['instrument 1'] || '';
    if (instrument1) {
      console.log(`  Step ${stepIndex}: Instrument 1 = "${instrument1}"`);
      processInstrument(instrument1, pattern, stepIndex, complexity);
      notesProcessed++;
      lastNoteStep = stepIndex;
    }

    // Process Instrument 2
    const instrument2 = row['Instrument 2'] || row['instrument 2'] || '';
    if (instrument2) {
      console.log(`  Step ${stepIndex}: Instrument 2 = "${instrument2}"`);
      processInstrument(instrument2, pattern, stepIndex, complexity);
      notesProcessed++;
      lastNoteStep = stepIndex;
    }

    stepIndex++;
  });
  
  // Trim pattern to actual length (last note + 1)
  const actualMaxSteps = lastNoteStep + 1;
  complexity.maxSteps = actualMaxSteps;
  complexity.hasEighthNotes = actualMaxSteps >= 16;
  complexity.hasSixteenthNotes = actualMaxSteps >= 32;
  
  // Trim all drum arrays to actual length
  Object.keys(pattern).forEach(key => {
    if (Array.isArray(pattern[key as keyof DrumPattern])) {
      (pattern[key as keyof DrumPattern] as any) = (pattern[key as keyof DrumPattern] as any).slice(0, actualMaxSteps);
    }
  });
  
  // Add subdivisions and sections to pattern (trimmed)
  pattern.subdivisions = subdivisions.slice(0, actualMaxSteps);
  pattern.sections = sections.slice(0, actualMaxSteps);
  pattern.length = actualMaxSteps;

  console.log('✅ parseSubdivisionFormat complete:', {
    totalRowsInCSV: stepIndex,
    actualMaxSteps,
    lastNoteStep,
    notesProcessed,
    kickNotes: pattern.kick.filter(n => n.active).length,
    snareNotes: pattern.snare.filter(n => n.active).length,
    hihatNotes: pattern.hihat.filter(n => n.active).length,
    openhatNotes: pattern.openhat.filter(n => n.active).length,
    rideNotes: pattern.ride.filter(n => n.active).length
  });

  return { pattern, complexity, bpm };
};

const processInstrument = (instrumentName: string, pattern: DrumPattern, stepIndex: number, complexity: PatternComplexity) => {
  const inst = instrumentName.toLowerCase().trim();
  if (!inst) {
    console.log(`    ⚠️ Empty instrument name at step ${stepIndex}`);
    return;
  }

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
    patternKey = 'tom';
    velocity = 0.8;
  } else if (inst.includes('crash')) {
    patternKey = 'crash';
    velocity = 0.9;
    type = 'accent';
  } else if (inst.includes('ride')) {
    patternKey = 'ride';
    velocity = 0.7;
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

  if (!patternKey) {
    console.log(`    ⚠️ Unrecognized instrument: "${instrumentName}" at step ${stepIndex}`);
    return;
  }
  
  const drumSteps = pattern[patternKey];
  if (!Array.isArray(drumSteps) || stepIndex >= drumSteps.length) {
    console.log(`    ⚠️ Invalid step index ${stepIndex} for ${patternKey}`);
    return;
  }

  const note: DrumNote | HiHatNote = {
    active: true,
    velocity,
    type
  };

  if (patternKey === 'hihat' || patternKey === 'openhat') {
    (note as HiHatNote).open = isOpen;
  }

  (drumSteps as any)[stepIndex] = note;
  console.log(`    ✅ Mapped "${instrumentName}" → ${patternKey}[${stepIndex}]`);
};

