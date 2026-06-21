import { describe, it, expect } from 'vitest';
import { getVitalityLevel } from '@/types/ecosystem';

// Logic representing the natural decay model
// Drops 0.02 vitality points per 24 hours of inactivity
const DECAY_RATE_PER_HOUR = 0.02 / 24;

function calculateDecay(currentScore: number, elapsedHours: number): number {
  const decayAmount = DECAY_RATE_PER_HOUR * elapsedHours;
  return Math.max(0.00, currentScore - decayAmount);
}

function calculateActionImpact(currentScore: number, delta: number): number {
  return Math.max(0.00, Math.min(1.00, currentScore + delta));
}

describe('Ecosystem Mathematical Models', () => {
  describe('Natural Inactivity Decay Model', () => {
    it('should calculate decay correctly over 24 hours', () => {
      const startingScore = 0.80;
      const hours = 24;
      const expectedScore = startingScore - 0.02; // 0.78
      
      const decayedScore = calculateDecay(startingScore, hours);
      expect(decayedScore).toBeCloseTo(expectedScore, 5);
    });

    it('should clamp decay at 0.00 and never go negative', () => {
      const startingScore = 0.01;
      const hours = 48; // Large enough to decay below 0
      
      const decayedScore = calculateDecay(startingScore, hours);
      expect(decayedScore).toBe(0.00);
    });
  });

  describe('Action Impact Addition Model', () => {
    it('should add positive action impact correctly', () => {
      const startingScore = 0.50;
      const delta = 0.12;
      const nextScore = calculateActionImpact(startingScore, delta);
      expect(nextScore).toBe(0.62);
    });

    it('should subtract negative habit impact correctly', () => {
      const startingScore = 0.50;
      const delta = -0.15;
      const nextScore = calculateActionImpact(startingScore, delta);
      expect(nextScore).toBe(0.35);
    });

    it('should clamp positive impacts at 1.00', () => {
      const startingScore = 0.95;
      const delta = 0.10;
      const nextScore = calculateActionImpact(startingScore, delta);
      expect(nextScore).toBe(1.00);
    });
  });

  describe('Qualitative Vitality Mapping', () => {
    it('should map score of 0.15 to Fragile', () => {
      const level = getVitalityLevel(0.15);
      expect(level.status).toBe('Fragile');
      expect(level.emoji).toBe('🌱');
    });

    it('should map score of 0.35 to Recovering', () => {
      const level = getVitalityLevel(0.35);
      expect(level.status).toBe('Recovering');
      expect(level.emoji).toBe('🌿');
    });

    it('should map score of 0.65 to Flourishing', () => {
      const level = getVitalityLevel(0.65);
      expect(level.status).toBe('Flourishing');
      expect(level.emoji).toBe('🌳');
    });

    it('should map score of 0.82 to Thriving', () => {
      const level = getVitalityLevel(0.82);
      expect(level.status).toBe('Thriving');
      expect(level.emoji).toBe('🦜');
    });

    it('should map score of 0.95 to Sanctuary', () => {
      const level = getVitalityLevel(0.95);
      expect(level.status).toBe('Sanctuary');
      expect(level.emoji).toBe('🌎');
    });
  });
});
