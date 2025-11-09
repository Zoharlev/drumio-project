export interface DrumNote {
  active: boolean;
  velocity: number; // 0-1, where 0.3 = ghost note, 0.7 = normal, 1.0 = accent
  type?: 'normal' | 'ghost' | 'accent';
}

export interface HiHatNote extends DrumNote {
  open?: boolean; // true for open hat, false for closed
}

export interface DrumPattern {
  [key: string]: DrumNote[] | HiHatNote[] | number | string[] | number[];
  kick: DrumNote[];
  snare: DrumNote[];
  ghostsnare: DrumNote[];
  hihat: HiHatNote[];
  openhat: HiHatNote[];
  tom: DrumNote[];
  lowtom: DrumNote[];
  crash: DrumNote[];
  ride: DrumNote[];
  length: number;
  subdivisions?: string[];
  offsets?: number[];
  sections?: string[];
}

export interface PatternComplexity {
  hasEighthNotes: boolean;
  hasSixteenthNotes: boolean;
  hasVelocityVariation: boolean;
  hasOpenHats: boolean;
  maxSteps: number; // 8 for quarter, 16 for eighth, 32 for sixteenth
}

export const createEmptyPattern = (steps: number = 16): DrumPattern => ({
  kick: Array(steps).fill(null).map(() => ({ active: false, velocity: 0.7, type: 'normal' })),
  snare: Array(steps).fill(null).map(() => ({ active: false, velocity: 0.7, type: 'normal' })),
  ghostsnare: Array(steps).fill(null).map(() => ({ active: false, velocity: 0.3, type: 'ghost' })),
  hihat: Array(steps).fill(null).map(() => ({ active: false, velocity: 0.7, type: 'normal', open: false })),
  openhat: Array(steps).fill(null).map(() => ({ active: false, velocity: 0.7, type: 'normal', open: true })),
  tom: Array(steps).fill(null).map(() => ({ active: false, velocity: 0.7, type: 'normal' })),
  lowtom: Array(steps).fill(null).map(() => ({ active: false, velocity: 0.8, type: 'normal' })),
  crash: Array(steps).fill(null).map(() => ({ active: false, velocity: 0.9, type: 'accent' })),
  ride: Array(steps).fill(null).map(() => ({ active: false, velocity: 0.7, type: 'normal' })),
  length: steps,
  subdivisions: [],
  offsets: [],
  sections: []
});