// TypeScript interfaces for VERDANT digital ecosystem domain logic

export type GuardianArchetype = 
  | 'Forest Guardian' 
  | 'River Protector' 
  | 'Mountain Keeper' 
  | 'Pollinator Ally'
  | 'Sun Keeper';

export type EcosystemVitality = 
  | 'Fragile'      // 🌱 Score < 0.2
  | 'Recovering'   // 🌿 0.2 <= Score < 0.5
  | 'Flourishing'  // 🌳 0.5 <= Score < 0.75
  | 'Thriving'     // 🦜 0.75 <= Score < 0.9
  | 'Sanctuary';   // 🌎 Score >= 0.9

export type WeatherCondition = 'sunny' | 'foggy' | 'rainy' | 'stormy';

export type ActionCategory = 
  | 'transportation' 
  | 'energy' 
  | 'waste' 
  | 'food' 
  | 'conservation';

export interface EcosystemState {
  userId: string;
  vitalityScore: number; // 0.00 to 1.00
  guardianArchetype: GuardianArchetype;
  ecosystemPersonality: string;
  growthStory: string;
  treeCount: number;
  flowerCount: number;
  weatherCondition: WeatherCondition;
  updatedAt: string;
}

export interface ActionLog {
  id: string;
  userId: string;
  rawDescription: string;
  category: ActionCategory;
  impactType: 'positive' | 'negative';
  vitalityDelta: number;
  co2SavedG: number;
  natureReflection: string;
  futureProjection5y: string;
  aiMetadata?: Record<string, any>;
  createdAt: string;
}

export type AssetType = 'oak' | 'pine' | 'flower' | 'withered_log';

export interface EcosystemAsset {
  id: string;
  userId: string;
  assetType: AssetType;
  pos: [number, number, number]; // [x, y, z] mapping to R3F coordinates
  scale: number;
  healthState: number; // 0.00 to 1.00 (degraded vs healthy asset)
  createdAt: string;
}

export interface CommunityEcosystem {
  id: string;
  name: string;
  vitalityScore: number;
  totalMembers: number;
  createdAt: string;
}

// Map numerical vitality scores to qualitative visual states
export function getVitalityLevel(score: number): { status: EcosystemVitality; emoji: string } {
  if (score < 0.2) return { status: 'Fragile', emoji: '🌱' };
  if (score < 0.5) return { status: 'Recovering', emoji: '🌿' };
  if (score < 0.75) return { status: 'Flourishing', emoji: '🌳' };
  if (score < 0.9) return { status: 'Thriving', emoji: '🦜' };
  return { status: 'Sanctuary', emoji: '🌎' };
}
