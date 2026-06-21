/**
 * VERDANT Unit Tests — Archetype Assignment & Vitality Calculations
 *
 * Coverage:
 *   - getVitalityLevel() boundary conditions
 *   - applyActionImpact() score clamping, weather transitions, archetype assignment
 *   - applyNaturalDecay() rate and floor
 *   - All five GuardianArchetype assignments
 *   - Projection state toggles
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getVitalityLevel } from '@/types/ecosystem';
import { useEcosystemStore } from '@/store/useEcosystemStore';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function freshStore() {
  useEcosystemStore.setState({
    vitalityScore: 0.50,
    guardianArchetype: 'Forest Guardian',
    ecosystemPersonality: '',
    growthStory: '',
    treeCount: 5,
    flowerCount: 3,
    weatherCondition: 'sunny',
    projectionMode: false,
    projectionYearOffset: 0,
    projectionPath: 'regeneration',
    actionLogs: [],
    assets: [],
  });
}

function addLogs(category: string, count: number) {
  const store = useEcosystemStore.getState();
  for (let i = 0; i < count; i++) {
    store.addActionLog({
      id: `log-${category}-${i}`,
      userId: 'test',
      rawDescription: `${category} action ${i}`,
      category: category as any,
      impactType: 'positive',
      vitalityDelta: 0.01,
      co2SavedG: 10,
      natureReflection: '',
      futureProjection5y: '',
      createdAt: new Date().toISOString(),
    });
  }
}

// ─────────────────────────────────────────────
// 1. Vitality Level Mapping
// ─────────────────────────────────────────────
describe('getVitalityLevel() — boundary conditions', () => {
  it('maps 0.00 → Fragile 🌱', () => {
    const v = getVitalityLevel(0.00);
    expect(v.status).toBe('Fragile');
    expect(v.emoji).toBe('🌱');
  });

  it('maps 0.199 → Fragile (just below 0.2 boundary)', () => {
    expect(getVitalityLevel(0.199).status).toBe('Fragile');
  });

  it('maps exactly 0.20 → Recovering 🌿', () => {
    expect(getVitalityLevel(0.20).status).toBe('Recovering');
  });

  it('maps 0.499 → Recovering (just below 0.5)', () => {
    expect(getVitalityLevel(0.499).status).toBe('Recovering');
  });

  it('maps exactly 0.50 → Flourishing 🌳', () => {
    const v = getVitalityLevel(0.50);
    expect(v.status).toBe('Flourishing');
    expect(v.emoji).toBe('🌳');
  });

  it('maps 0.749 → Flourishing (just below 0.75)', () => {
    expect(getVitalityLevel(0.749).status).toBe('Flourishing');
  });

  it('maps exactly 0.75 → Thriving 🦜', () => {
    const v = getVitalityLevel(0.75);
    expect(v.status).toBe('Thriving');
    expect(v.emoji).toBe('🦜');
  });

  it('maps 0.899 → Thriving (just below 0.9)', () => {
    expect(getVitalityLevel(0.899).status).toBe('Thriving');
  });

  it('maps exactly 0.90 → Sanctuary 🌎', () => {
    const v = getVitalityLevel(0.90);
    expect(v.status).toBe('Sanctuary');
    expect(v.emoji).toBe('🌎');
  });

  it('maps 1.00 → Sanctuary (maximum)', () => {
    expect(getVitalityLevel(1.00).status).toBe('Sanctuary');
  });
});

// ─────────────────────────────────────────────
// 2. Vitality Score Clamping
// ─────────────────────────────────────────────
describe('applyActionImpact() — score clamping', () => {
  beforeEach(freshStore);

  it('clamps score at 1.00 when positive delta overflows', () => {
    useEcosystemStore.getState().applyActionImpact(0.99, 'conservation', 'positive');
    expect(useEcosystemStore.getState().vitalityScore).toBe(1.00);
  });

  it('clamps score at 0.00 when negative delta underflows', () => {
    useEcosystemStore.getState().applyActionImpact(-0.99, 'waste', 'negative');
    expect(useEcosystemStore.getState().vitalityScore).toBe(0.00);
  });

  it('applies exact positive delta without floating-point drift', () => {
    useEcosystemStore.getState().applyActionImpact(0.15, 'conservation', 'positive');
    expect(useEcosystemStore.getState().vitalityScore).toBe(0.65);
  });

  it('applies exact negative delta without floating-point drift', () => {
    useEcosystemStore.getState().applyActionImpact(-0.20, 'waste', 'negative');
    expect(useEcosystemStore.getState().vitalityScore).toBe(0.30);
  });
});

// ─────────────────────────────────────────────
// 3. Weather Condition Transitions
// ─────────────────────────────────────────────
describe('applyActionImpact() — weather condition transitions', () => {
  beforeEach(freshStore);

  it('stays sunny above 0.5 vitality', () => {
    useEcosystemStore.getState().applyActionImpact(0.10, 'energy', 'positive'); // → 0.60
    expect(useEcosystemStore.getState().weatherCondition).toBe('sunny');
  });

  it('transitions to foggy in 0.3–0.49 range', () => {
    useEcosystemStore.getState().applyActionImpact(-0.16, 'waste', 'negative'); // 0.50 - 0.16 = 0.34
    expect(useEcosystemStore.getState().weatherCondition).toBe('foggy');
  });

  it('transitions to stormy below 0.3 vitality', () => {
    useEcosystemStore.getState().applyActionImpact(-0.30, 'waste', 'negative'); // 0.50 - 0.30 = 0.20
    expect(useEcosystemStore.getState().weatherCondition).toBe('stormy');
  });
});

// ─────────────────────────────────────────────
// 4. Natural Decay
// ─────────────────────────────────────────────
describe('applyNaturalDecay() — inactivity penalty', () => {
  const DECAY_PER_HOUR = 0.02 / 24;

  beforeEach(freshStore);

  it('decays exactly 0.02 over 24 hours', () => {
    useEcosystemStore.getState().applyNaturalDecay(24);
    const { vitalityScore } = useEcosystemStore.getState();
    expect(vitalityScore).toBeCloseTo(0.50 - 0.02, 4);
  });

  it('decays proportionally over 12 hours', () => {
    useEcosystemStore.getState().applyNaturalDecay(12);
    expect(useEcosystemStore.getState().vitalityScore).toBeCloseTo(0.50 - DECAY_PER_HOUR * 12, 5);
  });

  it('never decays below 0.00', () => {
    // Set near-zero and decay a huge span
    useEcosystemStore.setState({ vitalityScore: 0.01 });
    useEcosystemStore.getState().applyNaturalDecay(10000);
    expect(useEcosystemStore.getState().vitalityScore).toBe(0.00);
  });

  it('transitions to stormy when decay drops below 0.3', () => {
    useEcosystemStore.setState({ vitalityScore: 0.31 });
    useEcosystemStore.getState().applyNaturalDecay(24 * 5); // ~0.10 drop
    expect(useEcosystemStore.getState().weatherCondition).toBe('stormy');
  });
});

// ─────────────────────────────────────────────
// 5. Guardian Archetype Assignment — all five
// ─────────────────────────────────────────────
describe('Guardian Archetype assignment', () => {
  beforeEach(freshStore);

  it('assigns River Protector when transportation is dominant', () => {
    addLogs('transportation', 3);
    useEcosystemStore.getState().applyActionImpact(0.05, 'transportation', 'positive');
    expect(useEcosystemStore.getState().guardianArchetype).toBe('River Protector');
    expect(useEcosystemStore.getState().ecosystemPersonality).toContain('mindful mobility');
  });

  it('assigns Sun Keeper when energy is dominant', () => {
    addLogs('energy', 3);
    useEcosystemStore.getState().applyActionImpact(0.05, 'energy', 'positive');
    expect(useEcosystemStore.getState().guardianArchetype).toBe('Sun Keeper');
    expect(useEcosystemStore.getState().ecosystemPersonality).toContain('digital sun');
  });

  it('assigns Pollinator Ally when food is dominant', () => {
    addLogs('food', 3);
    useEcosystemStore.getState().applyActionImpact(0.05, 'food', 'positive');
    expect(useEcosystemStore.getState().guardianArchetype).toBe('Pollinator Ally');
    expect(useEcosystemStore.getState().ecosystemPersonality).toContain('biodiversity');
  });

  it('assigns Mountain Keeper when conservation is dominant', () => {
    addLogs('conservation', 3);
    useEcosystemStore.getState().applyActionImpact(0.05, 'conservation', 'positive');
    expect(useEcosystemStore.getState().guardianArchetype).toBe('Mountain Keeper');
    expect(useEcosystemStore.getState().ecosystemPersonality).toContain('reclamation');
  });

  it('assigns Forest Guardian when waste is dominant', () => {
    addLogs('waste', 3);
    useEcosystemStore.getState().applyActionImpact(0.05, 'waste', 'positive');
    expect(useEcosystemStore.getState().guardianArchetype).toBe('Forest Guardian');
    expect(useEcosystemStore.getState().ecosystemPersonality).toContain('mindful reclamation');
  });

  it('assigns Forest Guardian when no logs exist (default)', () => {
    useEcosystemStore.getState().applyActionImpact(0.01, 'waste', 'positive');
    expect(useEcosystemStore.getState().guardianArchetype).toBe('Forest Guardian');
  });
});

// ─────────────────────────────────────────────
// 6. Asset Counting
// ─────────────────────────────────────────────
describe('Asset management — treeCount & flowerCount', () => {
  beforeEach(() => {
    freshStore();
    useEcosystemStore.setState({ treeCount: 0, flowerCount: 0, assets: [] });
  });

  it('increments treeCount when oak asset added', () => {
    useEcosystemStore.getState().addAsset({
      id: 'a1', userId: 'u', assetType: 'oak',
      pos: [0, 0, 0], scale: 1, healthState: 1,
      createdAt: new Date().toISOString(),
    });
    expect(useEcosystemStore.getState().treeCount).toBe(1);
  });

  it('increments treeCount when pine asset added', () => {
    useEcosystemStore.getState().addAsset({
      id: 'a2', userId: 'u', assetType: 'pine',
      pos: [0, 0, 0], scale: 1, healthState: 1,
      createdAt: new Date().toISOString(),
    });
    expect(useEcosystemStore.getState().treeCount).toBe(1);
  });

  it('increments flowerCount when flower asset added', () => {
    useEcosystemStore.getState().addAsset({
      id: 'a3', userId: 'u', assetType: 'flower',
      pos: [0, 0, 0], scale: 1, healthState: 1,
      createdAt: new Date().toISOString(),
    });
    expect(useEcosystemStore.getState().flowerCount).toBe(1);
  });

  it('decrements treeCount when oak asset removed', () => {
    useEcosystemStore.getState().addAsset({
      id: 'a1', userId: 'u', assetType: 'oak',
      pos: [0, 0, 0], scale: 1, healthState: 1,
      createdAt: new Date().toISOString(),
    });
    useEcosystemStore.getState().removeAsset('a1');
    expect(useEcosystemStore.getState().treeCount).toBe(0);
  });

  it('no-ops silently when removing non-existent asset ID', () => {
    const before = useEcosystemStore.getState().treeCount;
    useEcosystemStore.getState().removeAsset('ghost-id');
    expect(useEcosystemStore.getState().treeCount).toBe(before);
  });
});

// ─────────────────────────────────────────────
// 7. Projection State
// ─────────────────────────────────────────────
describe('Future Projection state machine', () => {
  beforeEach(freshStore);

  it('starts with projectionMode false', () => {
    expect(useEcosystemStore.getState().projectionMode).toBe(false);
  });

  it('toggles projectionMode on/off', () => {
    useEcosystemStore.getState().setProjectionMode(true);
    expect(useEcosystemStore.getState().projectionMode).toBe(true);
    useEcosystemStore.getState().setProjectionMode(false);
    expect(useEcosystemStore.getState().projectionMode).toBe(false);
  });

  it('updates projectionYearOffset', () => {
    useEcosystemStore.getState().setProjectionYearOffset(3);
    expect(useEcosystemStore.getState().projectionYearOffset).toBe(3);
  });

  it('switches projectionPath between continuation and regeneration', () => {
    useEcosystemStore.getState().setProjectionPath('continuation');
    expect(useEcosystemStore.getState().projectionPath).toBe('continuation');
    useEcosystemStore.getState().setProjectionPath('regeneration');
    expect(useEcosystemStore.getState().projectionPath).toBe('regeneration');
  });
});
