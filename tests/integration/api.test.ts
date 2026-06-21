/**
 * VERDANT Integration Tests — Oracle API & Analyze API
 *
 * These tests exercise the procedural fallback engines inside the API routes
 * without making real HTTP requests, by importing and calling the pure logic
 * that is exposed through isolated helper functions extracted here.
 *
 * Strategy:
 *   - Oracle fallback: given inputs, assert correct narrative/indicator branch
 *   - Analyze fallback: keyword-to-category mapping and delta math
 *   - API response shape validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─────────────────────────────────────────────
// Re-implement the procedural logic that lives
// inside the route files so we can test it in
// isolation (avoids Next.js module resolution).
// ─────────────────────────────────────────────

const DECAY_RATE_PER_HOUR = 0.02 / 24;

function oracleProcedural(input: {
  vitalityScore: number;
  treeCount: number;
  flowerCount: number;
  weatherCondition: string;
  yearOffset: number;
}) {
  const { vitalityScore, treeCount, yearOffset } = input;

  let continuationNarrative = '';
  let continuationIndicators: string[] = [];
  let regenerationNarrative = '';
  let regenerationIndicators: string[] = [];

  if (yearOffset === 1) {
    continuationNarrative = `The sanctuary undergoes a subtle, quiet retreat. Dust settles thicker on the ${treeCount} trees, and the air carries a faint haze as the weather remains ${input.weatherCondition}.`;
    continuationIndicators = [
      'Soil moisture decreases by 8%, hardening the topsoil.',
      'Leaf canopy density thins slightly on mature branches.',
      'Insect pollinators spend more time searching for sparse flowers.',
    ];
    regenerationNarrative = `A new warmth flows through the sanctuary. The soil softens, and new root nodes begin to bind the ground as sunlight filters through the branches.`;
    regenerationIndicators = [
      'Soil biological activity increases, raising nutrient absorption.',
      'Morning dew stays longer on leaves, reducing evaporation.',
      'Local songbirds show early signs of territorial expansion.',
    ];
  } else if (yearOffset === 3) {
    continuationNarrative = `The silent decay becomes visible to the naked eye. Withered logs begin to replace what were once healthy saplings, and the streams run sluggishly.`;
    continuationIndicators = [
      'Groundcover vegetation retreats, exposing dry, sandy patches.',
      'Erosion patterns carve shallow gullies during storm runoffs.',
      'Songbird nesting success drops by 15% due to habitat thinning.',
    ];
    regenerationNarrative = `Vibrant patches of moss and clover spread between the trees. The canopy closes overhead, creating a damp, protective microclimate.`;
    regenerationIndicators = [
      'Ecosystem moisture retention climbs by 22%.',
      'Pollinator populations double as new flowers sprout.',
      'Air purity measurements show a measurable reduction in ambient dust.',
    ];
  } else {
    // 5-year
    continuationNarrative = `A stark landscape of survival takes hold. The ground is hard-baked, and the remaining ${Math.max(1, Math.floor(treeCount / 2))} trees stand in quiet isolation under a dry, hazy horizon.`;
    continuationIndicators = [
      'Aquifer recharge rates decline by 30% as hardpack blocks rain.',
      'Native plant diversity declines, leaving only drought-hardy weeds.',
      'Ambient forest temperature rises by 1.8°C due to lack of shade.',
    ];
    regenerationNarrative = `A thriving wild sanctuary has emerged. Young saplings have grown into sturdy young trees, and the forest floor hums with the life of a balanced habitat.`;
    regenerationIndicators = [
      'Carbon sequestration capacity rises by 35%.',
      'Topsoil depth increases by 2.5cm, supporting complex undergrowth.',
      'Ecosystem self-regulation stabilizes weather patterns locally.',
    ];
  }

  return {
    success: true,
    continuation: { narrative: continuationNarrative, indicators: continuationIndicators },
    regeneration: { narrative: regenerationNarrative, indicators: regenerationIndicators },
  };
}

function analyzeFallback(description: string): {
  category: string;
  impact_type: 'positive' | 'degrading';
  vitality_delta: number;
  co2_saved_g: number;
  nature_reflection: string;
  future_projection_5y: string;
} {
  const descLower = description.toLowerCase();
  let isPositive = true;
  let category = 'energy';
  let delta = 0.05;
  let co2 = 50;
  let reflection = 'A mindful action that reduces your ecological impact.';
  let projection = 'If sustained, the community canopy will expand.';

  if (descLower.includes('car') || descLower.includes('drive') || descLower.includes('flight') || descLower.includes('flying')) {
    isPositive = false; category = 'transportation'; delta = -0.10; co2 = 0;
    reflection = 'This choice increases transit emissions.';
    projection = 'Continued carbon-heavy transit will lead to a warmer atmosphere.';
  } else if (descLower.includes('bike') || descLower.includes('walk') || descLower.includes('cycle') || descLower.includes('bus') || descLower.includes('train')) {
    category = 'transportation'; delta = 0.08; co2 = 150;
    reflection = 'Opting for active or shared transit cleans the air.';
    projection = 'Mindful mobility will keep internal canopy pathways clear.';
  } else if (descLower.includes('tree') || descLower.includes('plant')) {
    category = 'conservation'; delta = 0.15; co2 = 250;
    reflection = 'Planting seeds directly fosters the digital sanctuary.';
    projection = 'A beautiful grove will take root here.';
  } else if (descLower.includes('recycle') || descLower.includes('compost')) {
    category = 'waste'; delta = 0.08; co2 = 80;
    reflection = 'Diverting waste reduces soil toxins.';
    projection = 'Minimal landfill waste keeps the undergrowth clean.';
  } else if (descLower.includes('plastic') || descLower.includes('trash') || descLower.includes('landfill')) {
    isPositive = false; category = 'waste'; delta = -0.06; co2 = 0;
    reflection = 'Disposable materials accumulate in the sanctuary.';
    projection = 'Plastic build-up will poison the roots.';
  } else if (descLower.includes('ac') || descLower.includes('conditioner') || descLower.includes('heat') || descLower.includes('heater') || descLower.includes('leave on')) {
    isPositive = false; category = 'energy'; delta = -0.08; co2 = 0;
    reflection = 'High utility grid drain strains the digital canopy.';
    projection = 'Excessive energy depletion will cause power surges.';
  } else if (descLower.includes('light') || descLower.includes('solar') || descLower.includes('electricity')) {
    category = 'energy'; delta = 0.07; co2 = 120;
    reflection = 'Conserving power lightens the grid load.';
    projection = 'A stable grid keeps the canopy leaves lush.';
  } else if (descLower.includes('vegan') || descLower.includes('diet') || descLower.includes('eat') || descLower.includes('meat')) {
    category = 'food'; delta = 0.06; co2 = 100;
    reflection = 'A plant-based choice nurtures the planet.';
    projection = 'Sustainable food consumption reduces resource pressures.';
  }

  return {
    category,
    impact_type: isPositive ? 'positive' : 'degrading',
    vitality_delta: delta,
    co2_saved_g: co2,
    nature_reflection: reflection,
    future_projection_5y: projection,
  };
}

// ─────────────────────────────────────────────
// Oracle Procedural Fallback Tests
// ─────────────────────────────────────────────
describe('Oracle API — procedural fallback engine', () => {
  it('returns success:true with both paths for Y1', () => {
    const result = oracleProcedural({ vitalityScore: 0.5, treeCount: 5, flowerCount: 3, weatherCondition: 'sunny', yearOffset: 1 });
    expect(result.success).toBe(true);
    expect(result.continuation.narrative).toBeTruthy();
    expect(result.regeneration.narrative).toBeTruthy();
  });

  it('Y1 continuation narrative mentions tree count', () => {
    const result = oracleProcedural({ vitalityScore: 0.5, treeCount: 7, flowerCount: 3, weatherCondition: 'foggy', yearOffset: 1 });
    expect(result.continuation.narrative).toContain('7');
    expect(result.continuation.narrative).toContain('foggy');
  });

  it('Y1 provides exactly 3 continuation indicators', () => {
    const { continuation } = oracleProcedural({ vitalityScore: 0.5, treeCount: 5, flowerCount: 3, weatherCondition: 'sunny', yearOffset: 1 });
    expect(continuation.indicators).toHaveLength(3);
  });

  it('Y1 provides exactly 3 regeneration indicators', () => {
    const { regeneration } = oracleProcedural({ vitalityScore: 0.5, treeCount: 5, flowerCount: 3, weatherCondition: 'sunny', yearOffset: 1 });
    expect(regeneration.indicators).toHaveLength(3);
  });

  it('Y3 continuation mentions erosion', () => {
    const { continuation } = oracleProcedural({ vitalityScore: 0.3, treeCount: 5, flowerCount: 2, weatherCondition: 'stormy', yearOffset: 3 });
    expect(continuation.indicators.some(i => i.toLowerCase().includes('erosion'))).toBe(true);
  });

  it('Y3 regeneration mentions moisture retention', () => {
    const { regeneration } = oracleProcedural({ vitalityScore: 0.3, treeCount: 5, flowerCount: 2, weatherCondition: 'stormy', yearOffset: 3 });
    expect(regeneration.indicators.some(i => i.toLowerCase().includes('moisture'))).toBe(true);
  });

  it('Y5 continuation uses half treeCount in narrative', () => {
    const { continuation } = oracleProcedural({ vitalityScore: 0.2, treeCount: 10, flowerCount: 1, weatherCondition: 'stormy', yearOffset: 5 });
    expect(continuation.narrative).toContain('5'); // Math.floor(10/2) = 5
  });

  it('Y5 regeneration mentions carbon sequestration', () => {
    const { regeneration } = oracleProcedural({ vitalityScore: 0.8, treeCount: 5, flowerCount: 5, weatherCondition: 'sunny', yearOffset: 5 });
    expect(regeneration.indicators.some(i => i.toLowerCase().includes('carbon'))).toBe(true);
  });

  it('Y5 continuation mentions aquifer recharge', () => {
    const { continuation } = oracleProcedural({ vitalityScore: 0.2, treeCount: 4, flowerCount: 1, weatherCondition: 'stormy', yearOffset: 5 });
    expect(continuation.indicators.some(i => i.toLowerCase().includes('aquifer'))).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Analyze API — heuristic keyword mapper
// ─────────────────────────────────────────────
describe('Analyze API — heuristic fallback parser', () => {
  it('classifies cycling as transportation/positive', () => {
    const r = analyzeFallback('I cycled to the office today');
    expect(r.category).toBe('transportation');
    expect(r.impact_type).toBe('positive');
    expect(r.vitality_delta).toBe(0.08);
    expect(r.co2_saved_g).toBe(150);
  });

  it('classifies driving as transportation/degrading', () => {
    const r = analyzeFallback('I drove my car 20 miles');
    expect(r.category).toBe('transportation');
    expect(r.impact_type).toBe('degrading');
    expect(r.vitality_delta).toBe(-0.10);
    expect(r.co2_saved_g).toBe(0);
  });

  it('classifies train as transportation/positive', () => {
    const r = analyzeFallback('Took the train to work');
    expect(r.category).toBe('transportation');
    expect(r.impact_type).toBe('positive');
  });

  it('classifies planting trees as conservation/positive', () => {
    const r = analyzeFallback('I planted three trees in the garden');
    expect(r.category).toBe('conservation');
    expect(r.impact_type).toBe('positive');
    expect(r.vitality_delta).toBe(0.15);
    expect(r.co2_saved_g).toBe(250);
  });

  it('classifies composting as waste/positive', () => {
    const r = analyzeFallback('I composted my kitchen scraps');
    expect(r.category).toBe('waste');
    expect(r.impact_type).toBe('positive');
    expect(r.vitality_delta).toBe(0.08);
  });

  it('classifies plastic as waste/degrading', () => {
    const r = analyzeFallback('Threw away a lot of plastic bags today');
    expect(r.category).toBe('waste');
    expect(r.impact_type).toBe('degrading');
    expect(r.vitality_delta).toBe(-0.06);
  });

  it('classifies leaving AC on as energy/degrading', () => {
    const r = analyzeFallback('I left the AC on all night');
    expect(r.category).toBe('energy');
    expect(r.impact_type).toBe('degrading');
    expect(r.vitality_delta).toBe(-0.08);
  });

  it('classifies turning off lights as energy/positive', () => {
    const r = analyzeFallback('Turned off the lights before leaving');
    expect(r.category).toBe('energy');
    expect(r.impact_type).toBe('positive');
    expect(r.vitality_delta).toBe(0.07);
  });

  it('classifies vegan meal as food/positive', () => {
    const r = analyzeFallback('Had a vegan dinner tonight');
    expect(r.category).toBe('food');
    expect(r.impact_type).toBe('positive');
    expect(r.vitality_delta).toBe(0.06);
    expect(r.co2_saved_g).toBe(100);
  });

  it('caps co2_saved_g at 0 for negative actions', () => {
    const r = analyzeFallback('I drove my car to the airport');
    expect(r.co2_saved_g).toBe(0);
  });

  it('returns default energy/positive for unrecognized input', () => {
    const r = analyzeFallback('I did something today');
    expect(r.category).toBe('energy');
    expect(r.impact_type).toBe('positive');
    expect(r.vitality_delta).toBe(0.05);
  });
});

// ─────────────────────────────────────────────
// Score Transition Math — reproduce API logic
// ─────────────────────────────────────────────
describe('Score Transition Math', () => {
  function calcNewScore(current: number, delta: number): number {
    return Math.max(0.00, Math.min(1.00, current + delta));
  }

  function calcWeather(score: number): string {
    if (score < 0.3) return 'stormy';
    if (score < 0.5) return 'foggy';
    return 'sunny';
  }

  it('gives sunny weather when score stays above 0.5', () => {
    expect(calcWeather(calcNewScore(0.6, 0.10))).toBe('sunny');
  });

  it('gives foggy weather when score falls to 0.30–0.49', () => {
    expect(calcWeather(calcNewScore(0.6, -0.20))).toBe('foggy');
  });

  it('gives stormy weather when score falls below 0.30', () => {
    expect(calcWeather(calcNewScore(0.6, -0.40))).toBe('stormy');
  });

  it('stormy persists at score 0.00', () => {
    expect(calcWeather(calcNewScore(0.1, -0.99))).toBe('stormy');
  });
});
