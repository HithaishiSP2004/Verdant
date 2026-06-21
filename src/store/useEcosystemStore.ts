import { create } from 'zustand';
import { 
  EcosystemState, 
  EcosystemAsset, 
  ActionLog, 
  WeatherCondition, 
  GuardianArchetype,
  getVitalityLevel
} from '@/types/ecosystem';

interface EcosystemStoreState {
  // Ecosystem profile properties
  vitalityScore: number;
  guardianArchetype: GuardianArchetype;
  ecosystemPersonality: string;
  growthStory: string;
  treeCount: number;
  flowerCount: number;
  weatherCondition: WeatherCondition;
  
  // Realtime assets and logs lists
  assets: EcosystemAsset[];
  actionLogs: ActionLog[];
  
  // Future Earth Simulation configuration
  projectionMode: boolean; // Is future preview active?
  projectionYearOffset: number; // e.g. +5 years
  projectionPath: 'continuation' | 'regeneration'; // Path chosen
  
  // Actions
  setEcosystemState: (state: Partial<EcosystemState>) => void;
  setAssets: (assets: EcosystemAsset[]) => void;
  addAsset: (asset: EcosystemAsset) => void;
  removeAsset: (assetId: string) => void;
  setActionLogs: (logs: ActionLog[]) => void;
  addActionLog: (log: ActionLog) => void;
  
  // Simulation methods
  setProjectionMode: (active: boolean) => void;
  setProjectionYearOffset: (years: number) => void;
  setProjectionPath: (path: 'continuation' | 'regeneration') => void;
  
  // Math: apply incremental actions and recalculate state
  applyActionImpact: (delta: number, category: string, impactType: 'positive' | 'negative') => void;
  applyNaturalDecay: (elapsedHours: number) => void;
}

// Math Decay Constant: drops 0.02 health points per 24 hours of total user inactivity
const DECAY_RATE_PER_HOUR = 0.02 / 24;

export const useEcosystemStore = create<EcosystemStoreState>((set) => ({
  vitalityScore: 0.50,
  guardianArchetype: 'Forest Guardian',
  ecosystemPersonality: 'The forest lies quiet, waiting for the first signs of conscious action.',
  growthStory: 'A new sanctuary is born. The initial roots have set hold.',
  treeCount: 5,
  flowerCount: 2,
  weatherCondition: 'sunny',
  assets: [],
  actionLogs: [],
  
  projectionMode: false,
  projectionYearOffset: 0,
  projectionPath: 'regeneration',
  
  setEcosystemState: (newState) => set((state) => ({ ...state, ...newState })),
  
  setAssets: (assets) => set({ assets }),
  
  addAsset: (asset) => set((state) => ({ 
    assets: [...state.assets, asset],
    treeCount: asset.assetType === 'oak' || asset.assetType === 'pine' ? state.treeCount + 1 : state.treeCount,
    flowerCount: asset.assetType === 'flower' ? state.flowerCount + 1 : state.flowerCount
  })),
  
  removeAsset: (assetId) => set((state) => {
    const assetToRemove = state.assets.find(a => a.id === assetId);
    if (!assetToRemove) return {};
    
    return {
      assets: state.assets.filter(a => a.id !== assetId),
      treeCount: assetToRemove.assetType === 'oak' || assetToRemove.assetType === 'pine' ? state.treeCount - 1 : state.treeCount,
      flowerCount: assetToRemove.assetType === 'flower' ? state.flowerCount - 1 : state.flowerCount
    };
  }),
  
  setActionLogs: (actionLogs) => set({ actionLogs }),
  
  addActionLog: (log) => set((state) => ({ 
    actionLogs: [log, ...state.actionLogs] 
  })),
  
  setProjectionMode: (projectionMode) => set({ projectionMode }),
  setProjectionYearOffset: (projectionYearOffset) => set({ projectionYearOffset }),
  setProjectionPath: (projectionPath) => set({ projectionPath }),
  
  applyActionImpact: (delta, category, impactType) => set((state) => {
    const nextScore = Math.round(Math.max(0.00, Math.min(1.00, state.vitalityScore + delta)) * 100) / 100;
    
    // Dynamically update weather state based on new vitality score threshold
    let nextWeather: WeatherCondition = state.weatherCondition;
    if (nextScore >= 0.8) {
      nextWeather = 'sunny';
    } else if (nextScore >= 0.5) {
      nextWeather = 'sunny';
    } else if (nextScore >= 0.3) {
      nextWeather = 'foggy';
    } else {
      nextWeather = 'stormy';
    }

    // Heuristically calculate dominant category to update EcoTwin Archetype
    const categoriesCount: Record<string, number> = {};
    state.actionLogs.forEach(log => {
      categoriesCount[log.category] = (categoriesCount[log.category] || 0) + 1;
    });
    // Add current category context
    categoriesCount[category] = (categoriesCount[category] || 0) + 1;

    let dominantCategory = category;
    let maxCount = 0;
    for (const cat in categoriesCount) {
      if (categoriesCount[cat] > maxCount) {
        maxCount = categoriesCount[cat];
        dominantCategory = cat;
      }
    }

    let guardianArchetype: GuardianArchetype = 'Forest Guardian';
    let ecosystemPersonality = 'You thrive through consistent small acts of reclamation and nurturing.';
    let growthStory = 'A new sanctuary is born. The initial roots have set hold.';

    if (dominantCategory === 'transportation') {
      guardianArchetype = 'River Protector';
      ecosystemPersonality = 'You heal the flows and pathways of the earth through mindful mobility.';
      growthStory = 'The streams within your sanctuary run crystal clear, reflecting your sustainable journeys.';
    } else if (dominantCategory === 'energy') {
      guardianArchetype = 'Sun Keeper';
      ecosystemPersonality = 'You kindle the digital sun and balance grid loads with clean consumption.';
      growthStory = 'Solar rays penetrate the canopy, warming the ground with conserved power reserves.';
    } else if (dominantCategory === 'food') {
      guardianArchetype = 'Pollinator Ally';
      ecosystemPersonality = 'You support biodiversity and sustainable nourishment, keeping ecosystems balanced.';
      growthStory = 'Bumblebees and birds hum through fields of wild flowers nourished by plant-based choices.';
    } else if (dominantCategory === 'conservation') {
      guardianArchetype = 'Mountain Keeper';
      ecosystemPersonality = 'You protect the trees, mountains, and wild soils through active reclamation.';
      growthStory = 'Mighty peaks rise behind growing pine groves, standing watch over your sanctuary.';
    } else {
      guardianArchetype = 'Forest Guardian';
      ecosystemPersonality = 'You nurture trees and soil directly through mindful reclamation and resource reuse.';
      growthStory = 'Your persistent acts of forestry and waste reduction have grounded the forest floor with life.';
    }
    
    return {
      vitalityScore: nextScore,
      weatherCondition: nextWeather,
      guardianArchetype,
      ecosystemPersonality,
      growthStory
    };
  }),
  
  applyNaturalDecay: (elapsedHours) => set((state) => {
    const decayAmount = DECAY_RATE_PER_HOUR * elapsedHours;
    const nextScore = Math.max(0.00, state.vitalityScore - decayAmount);
    
    let nextWeather: WeatherCondition = state.weatherCondition;
    if (nextScore < 0.3) {
      nextWeather = 'stormy';
    } else if (nextScore < 0.5) {
      nextWeather = 'foggy';
    }
    
    return {
      vitalityScore: nextScore,
      weatherCondition: nextWeather
    };
  })
}));
