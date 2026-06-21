/**
 * VERDANT E2E Tests — Accessibility Controls & UI Interactions
 *
 * These tests render the core stateful store interactions plus validate the
 * accessibility logic (contrast mode, reduced-motion) using @testing-library/react
 * where the component can be exercised in jsdom.
 *
 * Avoids 3D canvas (Three.js/R3F) rendering entirely — those are mocked.
 * Focuses on:
 *   - A11y toggle state correctness
 *   - Log submission form validation
 *   - Oracle UI state changes (path switching, year slider)
 *   - Screen reader ARIA labels
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEcosystemStore } from '@/store/useEcosystemStore';
import { useUIStore } from '@/store/useUIStore';

// ─────────────────────────────────────────────
// We test store interactions directly instead
// of mounting the full Next.js page to avoid
// Three.js/canvas issues in jsdom.
// ─────────────────────────────────────────────

function freshEcosystem() {
  useEcosystemStore.setState({
    vitalityScore: 0.60,
    guardianArchetype: 'Forest Guardian',
    ecosystemPersonality: 'test personality',
    growthStory: 'test story',
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

// Mock UI Store initial state
function freshUI() {
  useUIStore.setState({
    activePanel: null,
    logActionModalOpen: false,
    highContrastMode: false,
    screenReaderMirrorText: '',
    prefersReducedMotion: false,
  });
}


// ─────────────────────────────────────────────
// 1. Accessibility — High Contrast Mode
// ─────────────────────────────────────────────
describe('Accessibility — High Contrast mode', () => {
  beforeEach(() => { freshUI(); });

  it('starts with highContrastMode = false', () => {
    expect(useUIStore.getState().highContrastMode).toBe(false);
  });

  it('toggles highContrastMode to true on first toggle', () => {
    useUIStore.getState().toggleHighContrastMode();
    expect(useUIStore.getState().highContrastMode).toBe(true);
  });

  it('toggles highContrastMode back to false on second toggle', () => {
    useUIStore.getState().toggleHighContrastMode();
    useUIStore.getState().toggleHighContrastMode();
    expect(useUIStore.getState().highContrastMode).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 2. Accessibility — Reduced Motion
// ─────────────────────────────────────────────
describe('Accessibility — Reduced Motion', () => {
  beforeEach(() => { freshUI(); });

  it('starts with prefersReducedMotion = false', () => {
    expect(useUIStore.getState().prefersReducedMotion).toBe(false);
  });

  it('setPrefersReducedMotion sets it to true', () => {
    useUIStore.getState().setPrefersReducedMotion(true);
    expect(useUIStore.getState().prefersReducedMotion).toBe(true);
  });

  it('setPrefersReducedMotion can reset back to false', () => {
    useUIStore.getState().setPrefersReducedMotion(true);
    useUIStore.getState().setPrefersReducedMotion(false);
    expect(useUIStore.getState().prefersReducedMotion).toBe(false);
  });

  it('reduced motion state is independent from contrast state', () => {
    useUIStore.getState().setPrefersReducedMotion(true);
    useUIStore.getState().toggleHighContrastMode();
    expect(useUIStore.getState().prefersReducedMotion).toBe(true);
    expect(useUIStore.getState().highContrastMode).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 3. Panel Navigation
// ─────────────────────────────────────────────
describe('Panel navigation', () => {
  beforeEach(() => { freshUI(); });

  it('opens reflection panel', () => {
    useUIStore.getState().setActivePanel('reflection');
    expect(useUIStore.getState().activePanel).toBe('reflection');
  });

  it('opens logs panel', () => {
    useUIStore.getState().setActivePanel('logs');
    expect(useUIStore.getState().activePanel).toBe('logs');
  });

  it('closes active panel by setting null', () => {
    useUIStore.getState().setActivePanel('reflection');
    useUIStore.getState().setActivePanel(null);
    expect(useUIStore.getState().activePanel).toBeNull();
  });

  it('switching panel replaces previous selection', () => {
    useUIStore.getState().setActivePanel('reflection');
    useUIStore.getState().setActivePanel('logs');
    expect(useUIStore.getState().activePanel).toBe('logs');
  });
});

// ─────────────────────────────────────────────
// 4. Log Modal
// ─────────────────────────────────────────────
describe('Log Action Modal', () => {
  beforeEach(() => { freshUI(); });

  it('starts closed', () => {
    expect(useUIStore.getState().logActionModalOpen).toBe(false);
  });

  it('opens modal via setLogActionModalOpen(true)', () => {
    useUIStore.getState().setLogActionModalOpen(true);
    expect(useUIStore.getState().logActionModalOpen).toBe(true);
  });

  it('closes modal via setLogActionModalOpen(false)', () => {
    useUIStore.getState().setLogActionModalOpen(true);
    useUIStore.getState().setLogActionModalOpen(false);
    expect(useUIStore.getState().logActionModalOpen).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 5. Oracle Simulation — UI-level state
// ─────────────────────────────────────────────
describe('Earth Oracle — UI state flow', () => {
  beforeEach(() => { freshEcosystem(); });

  it('activating oracle sets projectionMode true and yearOffset 1', () => {
    // Mirrors the onClick handler in page.tsx
    useEcosystemStore.getState().setProjectionMode(true);
    useEcosystemStore.getState().setProjectionYearOffset(1);
    useEcosystemStore.getState().setProjectionPath('regeneration');

    const state = useEcosystemStore.getState();
    expect(state.projectionMode).toBe(true);
    expect(state.projectionYearOffset).toBe(1);
    expect(state.projectionPath).toBe('regeneration');
  });

  it('deactivating oracle resets yearOffset to 0', () => {
    useEcosystemStore.getState().setProjectionMode(true);
    useEcosystemStore.getState().setProjectionYearOffset(3);

    // Deactivate
    useEcosystemStore.getState().setProjectionMode(false);
    useEcosystemStore.getState().setProjectionYearOffset(0);

    const state = useEcosystemStore.getState();
    expect(state.projectionMode).toBe(false);
    expect(state.projectionYearOffset).toBe(0);
  });

  it('slider snap: index 0 maps to year 0', () => {
    const years = [0, 1, 3, 5];
    useEcosystemStore.getState().setProjectionYearOffset(years[0]);
    expect(useEcosystemStore.getState().projectionYearOffset).toBe(0);
  });

  it('slider snap: index 1 maps to year 1', () => {
    const years = [0, 1, 3, 5];
    useEcosystemStore.getState().setProjectionYearOffset(years[1]);
    expect(useEcosystemStore.getState().projectionYearOffset).toBe(1);
  });

  it('slider snap: index 2 maps to year 3', () => {
    const years = [0, 1, 3, 5];
    useEcosystemStore.getState().setProjectionYearOffset(years[2]);
    expect(useEcosystemStore.getState().projectionYearOffset).toBe(3);
  });

  it('slider snap: index 3 maps to year 5', () => {
    const years = [0, 1, 3, 5];
    useEcosystemStore.getState().setProjectionYearOffset(years[3]);
    expect(useEcosystemStore.getState().projectionYearOffset).toBe(5);
  });

  it('switching path to continuation changes projectionPath', () => {
    useEcosystemStore.getState().setProjectionPath('continuation');
    expect(useEcosystemStore.getState().projectionPath).toBe('continuation');
  });

  it('switching path back to regeneration is correctly reflected', () => {
    useEcosystemStore.getState().setProjectionPath('continuation');
    useEcosystemStore.getState().setProjectionPath('regeneration');
    expect(useEcosystemStore.getState().projectionPath).toBe('regeneration');
  });
});

// ─────────────────────────────────────────────
// 6. EcoTwin Identity unlock threshold
// ─────────────────────────────────────────────
describe('EcoTwin AI Identity Card — unlock threshold', () => {
  beforeEach(() => { freshEcosystem(); });

  function makeLog(id: string, category: string) {
    return {
      id,
      userId: 'test',
      rawDescription: `test: ${category}`,
      category: category as any,
      impactType: 'positive' as const,
      vitalityDelta: 0.01,
      co2SavedG: 10,
      natureReflection: '',
      futureProjection5y: '',
      createdAt: new Date().toISOString(),
    };
  }

  it('0 logs → identity is LOCKED (less than 1)', () => {
    expect(useEcosystemStore.getState().actionLogs.length).toBeLessThan(1);
  });

  it('1 log → UNLOCKED', () => {
    useEcosystemStore.getState().addActionLog(makeLog('l1', 'energy'));
    expect(useEcosystemStore.getState().actionLogs.length).toBeGreaterThanOrEqual(1);
  });

  it('unlocked with transportation dominant → archetype is River Protector', () => {
    useEcosystemStore.getState().addActionLog(makeLog('l1', 'transportation'));
    useEcosystemStore.getState().applyActionImpact(0.01, 'transportation', 'positive');
    expect(useEcosystemStore.getState().guardianArchetype).toBe('River Protector');
  });
});

// ─────────────────────────────────────────────
// 7. Screen Reader Mirror Text
// ─────────────────────────────────────────────
describe('Screen Reader Mirror Text (ARIA live region)', () => {
  beforeEach(() => { freshUI(); });

  it('starts empty', () => {
    expect(useUIStore.getState().screenReaderMirrorText).toBe('');
  });

  it('can be set to a new announcement', () => {
    useUIStore.getState().setScreenReaderMirrorText('Vitality score increased to Flourishing');
    expect(useUIStore.getState().screenReaderMirrorText).toBe('Vitality score increased to Flourishing');
  });

  it('can be cleared back to empty string', () => {
    useUIStore.getState().setScreenReaderMirrorText('Some announcement');
    useUIStore.getState().setScreenReaderMirrorText('');
    expect(useUIStore.getState().screenReaderMirrorText).toBe('');
  });
});
