import { describe, it, expect, beforeEach } from 'vitest';
import { useEcosystemStore } from '../../src/store/useEcosystemStore';

describe('useEcosystemStore State and Actions', () => {
  beforeEach(() => {
    // Reset Zustand store to initial state before each test
    useEcosystemStore.setState({
      vitalityScore: 0.65,
      guardianArchetype: 'Forest Guardian',
      ecosystemPersonality: 'You thrive through consistent small acts of reclamation and nurturing.',
      growthStory: 'A new sanctuary is born. The initial roots have set hold.',
      treeCount: 5,
      flowerCount: 3,
      weatherCondition: 'sunny',
      projectionMode: false,
      projectionYearOffset: 0,
      actionLogs: [],
      assets: [
        { id: '1', userId: 'test-user', assetType: 'pine_tree', pos: [-2, 0, -2], healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '2', userId: 'test-user', assetType: 'oak_tree', pos: [2, 0, 2], healthState: 1.0, createdAt: new Date().toISOString() },
        { id: '3', userId: 'test-user', assetType: 'flower', pos: [-1, 0, 1], healthState: 1.0, createdAt: new Date().toISOString() },
      ],
    });
  });

  it('should initialize with default states', () => {
    const state = useEcosystemStore.getState();
    expect(state.vitalityScore).toBe(0.65);
    expect(state.guardianArchetype).toBe('Forest Guardian');
    expect(state.weatherCondition).toBe('sunny');
  });

  it('should update vitality and weather conditions on action impacts', () => {
    const store = useEcosystemStore.getState();
    
    // Test positive impact pushing into high vitality (sunny)
    store.applyActionImpact(0.20, 'conservation', 'positive');
    let updated = useEcosystemStore.getState();
    expect(updated.vitalityScore).toBe(0.85);
    expect(updated.weatherCondition).toBe('sunny');

    // Test negative impact pulling vitality down (foggy)
    store.applyActionImpact(-0.45, 'waste', 'negative');
    updated = useEcosystemStore.getState();
    expect(updated.vitalityScore).toBe(0.40);
    expect(updated.weatherCondition).toBe('foggy');

    // Test extreme negative impact pulling vitality down (stormy)
    store.applyActionImpact(-0.25, 'waste', 'negative');
    updated = useEcosystemStore.getState();
    expect(updated.vitalityScore).toBe(0.15);
    expect(updated.weatherCondition).toBe('stormy');
  });

  it('should calculate dominant categories and assign the correct guardianArchetype', () => {
    const store = useEcosystemStore.getState();

    // 1. Log a transportation (mobility) action
    store.addActionLog({
      id: 'log-1',
      userId: 'test-user',
      rawDescription: 'Biked to the supermarket',
      category: 'transportation',
      impactType: 'positive',
      vitalityDelta: 0.05,
      co2SavedG: 120,
      natureReflection: 'The stream bubbles happily as wheels spin instead of cylinders.',
      createdAt: new Date().toISOString(),
    });

    store.applyActionImpact(0.05, 'transportation', 'positive');
    let updated = useEcosystemStore.getState();
    expect(updated.guardianArchetype).toBe('River Protector');
    expect(updated.ecosystemPersonality).toContain('mindful mobility');

    // 2. Log an energy action
    store.addActionLog({
      id: 'log-2',
      userId: 'test-user',
      rawDescription: 'Turned off lights in empty rooms',
      category: 'energy',
      impactType: 'positive',
      vitalityDelta: 0.04,
      co2SavedG: 80,
      natureReflection: 'Vapor dissipates as electricity demand declines.',
      createdAt: new Date().toISOString(),
    });

    store.applyActionImpact(0.04, 'energy', 'positive');
    // Currently, it counts mobility = 1, energy = 1. The last logged 'energy' takes tie-breaker precedence.
    updated = useEcosystemStore.getState();
    expect(updated.guardianArchetype).toBe('Sun Keeper');
    expect(updated.ecosystemPersonality).toContain('digital sun');

    // 3. Log a waste/forestry action to trigger Forest Guardian
    store.addActionLog({
      id: 'log-3',
      userId: 'test-user',
      rawDescription: 'Recycled compost scraps',
      category: 'waste',
      impactType: 'positive',
      vitalityDelta: 0.03,
      co2SavedG: 40,
      natureReflection: 'Nourished soil breathes easy.',
      createdAt: new Date().toISOString(),
    });
    // Log one more waste action to make it dominant
    store.addActionLog({
      id: 'log-4',
      userId: 'test-user',
      rawDescription: 'Avoided single-use plastics',
      category: 'waste',
      impactType: 'positive',
      vitalityDelta: 0.03,
      co2SavedG: 50,
      natureReflection: 'Roots stretch deeper into trash-free soils.',
      createdAt: new Date().toISOString(),
    });

    store.applyActionImpact(0.03, 'waste', 'positive');
    updated = useEcosystemStore.getState();
    expect(updated.guardianArchetype).toBe('Forest Guardian');
    expect(updated.ecosystemPersonality).toContain('mindful reclamation');
  });
});
