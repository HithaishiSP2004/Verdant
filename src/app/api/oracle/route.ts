import { NextResponse } from 'next/server';
import { genAI, GEMINI_MODEL_CHAIN } from '@/lib/gemini';
import { SchemaType } from '@google/generative-ai';
import { getVitalityLevel } from '@/types/ecosystem';

const oracleSchema = {
  type: SchemaType.OBJECT,
  properties: {
    continuation_path: {
      type: SchemaType.OBJECT,
      properties: {
        narrative: {
          type: SchemaType.STRING,
          description: 'A poetic, sensory, evocative 2-3 sentence narrative describing the future of the sanctuary under a continuation path.'
        },
        indicators: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: '3 or 4 specific, bulleted ecosystem metrics or animal behaviors for the continuation timeline.'
        }
      },
      required: ['narrative', 'indicators']
    },
    regeneration_path: {
      type: SchemaType.OBJECT,
      properties: {
        narrative: {
          type: SchemaType.STRING,
          description: 'A poetic, sensory, evocative 2-3 sentence narrative describing the future of the sanctuary under a regeneration path.'
        },
        indicators: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: '3 or 4 specific, bulleted ecosystem metrics or animal behaviors for the regeneration timeline.'
        }
      },
      required: ['narrative', 'indicators']
    }
  },
  required: ['continuation_path', 'regeneration_path']
};

export async function POST(req: Request) {
  try {
    const { vitalityScore, weatherCondition, treeCount, flowerCount, yearOffset } = await req.json();

    const yearsText = yearOffset === 1 ? '1 year' : `${yearOffset} years`;
    const vitalityInfo = getVitalityLevel(vitalityScore || 0.5);

    // Prompt design for Gemini
    const prompt = `
      Current Ecosystem State:
      - Vitality Status: ${vitalityInfo.status} (Numeric Score: ${vitalityScore})
      - Weather Condition: ${weatherCondition}
      - Tree Count: ${treeCount}
      - Flower Count: ${flowerCount}

      Generate two alternative future timelines for exactly ${yearsText} in the future.
      
      Path A (continuation_path): What happens to this sanctuary if current baseline habits and resource degradation patterns persist or worsen over the next ${yearsText}?
      Path B (regeneration_path): What happens to this sanctuary if active restorative efforts, habit shifts, and conscious conservation heal the land over the next ${yearsText}?

      Return the narratives and specific biological indicators using the requested JSON schema.
    `;

    // Try Gemini first if API key is present — 4-model fallback chain
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-')) {
      for (const modelName of GEMINI_MODEL_CHAIN) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: oracleSchema as any,
              temperature: 0.7,
            },
          });

          const result = await model.generateContent(prompt);
          const data = JSON.parse(result.response.text());
          console.log(`[oracle] Model succeeded: ${modelName}`);

          return NextResponse.json({
            success: true,
            continuation: data.continuation_path,
            regeneration: data.regeneration_path,
          });
        } catch (modelErr: any) {
          console.warn(`[oracle] Model ${modelName} failed: ${modelErr?.message || modelErr}`);
        }
      }
      console.error('[oracle] All Gemini models exhausted, falling back to procedural rules.');
    }

    // High-fidelity Procedural Fallback Engine
    const isLowVitality = vitalityScore < 0.5;
    
    // Procedural definitions based on years
    let continuationNarrative = '';
    let continuationIndicators: string[] = [];
    let regenerationNarrative = '';
    let regenerationIndicators: string[] = [];

    if (yearOffset === 1) {
      continuationNarrative = `The sanctuary undergoes a subtle, quiet retreat. Dust settles thicker on the ${treeCount} trees, and the air carries a faint haze as the weather remains ${weatherCondition}.`;
      continuationIndicators = [
        'Soil moisture decreases by 8%, hardening the topsoil.',
        'Leaf canopy density thins slightly on mature branches.',
        'Insect pollinators spend more time searching for sparse flowers.'
      ];

      regenerationNarrative = `A new warmth flows through the sanctuary. The soil softens, and new root nodes begin to bind the ground as sunlight filters through the branches.`;
      regenerationIndicators = [
        'Soil biological activity increases, raising nutrient absorption.',
        'Morning dew stays longer on leaves, reducing evaporation.',
        'Local songbirds show early signs of territorial expansion.'
      ];
    } else if (yearOffset === 3) {
      continuationNarrative = `The silent decay becomes visible to the naked eye. Withered logs begin to replace what were once healthy saplings, and the streams run sluggishly.`;
      continuationIndicators = [
        'Groundcover vegetation retreats, exposing dry, sandy patches.',
        'Erosion patterns carve shallow gullies during storm runoffs.',
        'Songbird nesting success drops by 15% due to habitat thinning.'
      ];

      regenerationNarrative = `Vibrant patches of moss and clover spread between the trees. The canopy closes overhead, creating a damp, protective microclimate.`;
      regenerationIndicators = [
        'Ecosystem moisture retention climbs by 22%.',
        'Pollinator populations double as new flowers sprout.',
        'Air purity measurements show a measurable reduction in ambient dust.'
      ];
    } else { // 5 years
      continuationNarrative = `A stark landscape of survival takes hold. The ground is hard-baked, and the remaining ${Math.max(1, Math.floor(treeCount / 2))} trees stand in quiet isolation under a dry, hazy horizon.`;
      continuationIndicators = [
        'Aquifer recharge rates decline by 30% as hardpack blocks rain.',
        'Native plant diversity declines, leaving only drought-hardy weeds.',
        'Ambient forest temperature rises by 1.8°C due to lack of shade.'
      ];

      regenerationNarrative = `A thriving wild sanctuary has emerged. Young saplings have grown into sturdy young trees, and the forest floor hums with the life of a balanced habitat.`;
      regenerationIndicators = [
        'Carbon sequestration capacity rises by 35%.',
        'Topsoil depth increases by 2.5cm, supporting complex undergrowth.',
        'Ecosystem self-regulation stabilizes weather patterns locally.'
      ];
    }

    return NextResponse.json({
      success: true,
      continuation: {
        narrative: continuationNarrative,
        indicators: continuationIndicators
      },
      regeneration: {
        narrative: regenerationNarrative,
        indicators: regenerationIndicators
      }
    });

  } catch (error) {
    console.error('Oracle Route Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to project future' }, { status: 500 });
  }
}
