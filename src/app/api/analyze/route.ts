import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { genAI, actionAnalysisSchema, systemInstruction, GEMINI_MODEL_CHAIN } from '@/lib/gemini';
import { z } from 'zod';

const requestSchema = z.object({
  description: z.string().min(3).max(500).trim(),
});

export async function POST(request: Request) {
  try {
    const isSandbox = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('local-sandbox') || process.env.NODE_ENV === 'development';
    let user = null;
    let supabase = null;

    if (!isSandbox) {
      supabase = await createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
      }
      user = authUser;
    } else {
      user = { id: 'demo-user-id', email: 'demo@verdant.earth' };
    }

    // 2. Validate request body
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input description (min 3, max 500 characters)' }, { status: 400 });
    }

    const { description } = parsed.data;

    // 3. Invoke Gemini API for structured action analysis — 4-model fallback chain
    let analysis;
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('dummy')) {
        throw new Error('Using dummy Gemini key — skipping to heuristic fallback');
      }

      let geminiSuccess = false;
      for (const modelName of GEMINI_MODEL_CHAIN) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: actionAnalysisSchema as any,
            },
          });
          const prompt = `Log Entry: "${description}"`;
          const result = await model.generateContent(prompt);
          analysis = JSON.parse(result.response.text());
          console.log(`[analyze] Model succeeded: ${modelName}`);
          geminiSuccess = true;
          break;
        } catch (modelErr: any) {
          console.warn(`[analyze] Model ${modelName} failed: ${modelErr?.message || modelErr}`);
        }
      }

      if (!geminiSuccess) throw new Error('All Gemini models exhausted');
    } catch (geminiError) {
      console.warn('Gemini invocation failed, falling back to heuristic parser:', geminiError);
      
      // Heuristic analysis fallback for offline/sandbox modes
      const descLower = description.toLowerCase();
      let isPositive = true;
      let category = 'energy';
      let delta = 0.05;
      let co2 = 50;
      let reflection = 'A mindful action that reduces your ecological impact.';
      let projection = 'If sustained, the community canopy will expand, supporting local biodiversity and clean air.';

      if (descLower.includes('car') || descLower.includes('drive') || descLower.includes('flight') || descLower.includes('flying')) {
        isPositive = false;
        category = 'transportation';
        delta = -0.10;
        co2 = 0;
        reflection = 'This choice increases transit emissions. Reflect on sustainable alternatives.';
        projection = 'Continued carbon-heavy transit will lead to a warmer, more volatile atmospheric canopy.';
      } else if (descLower.includes('bike') || descLower.includes('walk') || descLower.includes('cycle') || descLower.includes('bus') || descLower.includes('transit') || descLower.includes('train')) {
        category = 'transportation';
        delta = 0.08;
        co2 = 150;
        reflection = 'Opting for active or shared transit cleans the air and keeps the sanctuary moving forward.';
        projection = 'Mindful mobility will keep internal canopy pathways clear and soil toxicity low.';
      } else if (descLower.includes('tree') || descLower.includes('plant')) {
        category = 'conservation';
        delta = 0.15;
        co2 = 250;
        reflection = 'Planting seeds directly fosters the digital sanctuary and physical atmosphere.';
        projection = 'A beautiful grove will take root here, providing cooling shade and abundant vegetation.';
      } else if (descLower.includes('recycle') || descLower.includes('compost')) {
        category = 'waste';
        delta = 0.08;
        co2 = 80;
        reflection = 'Diverting waste reduces soil toxins and returns nutrients to the cycle.';
        projection = 'Minimal landfill waste keeps the undergrowth clean and prevents resource depletion.';
      } else if (descLower.includes('plastic') || descLower.includes('trash') || descLower.includes('landfill') || descLower.includes('throw away')) {
        isPositive = false;
        category = 'waste';
        delta = -0.06;
        co2 = 0;
        reflection = 'Disposable materials accumulate in the sanctuary, taxing local soil health.';
        projection = 'Plastic build-up will poison the roots and groundwaters, leading to stunted vegetation.';
      } else if (descLower.includes('ac') || descLower.includes('conditioner') || descLower.includes('heat') || descLower.includes('heater') || descLower.includes('leave on')) {
        isPositive = false;
        category = 'energy';
        delta = -0.08;
        co2 = 0;
        reflection = 'High utility grid drain strains the digital canopy.';
        projection = 'Excessive energy depletion will cause power surges, dry forest conditions, and high fire risks.';
      } else if (descLower.includes('light') || descLower.includes('solar') || descLower.includes('electricity') || descLower.includes('appliance')) {
        category = 'energy';
        delta = 0.07;
        co2 = 120;
        reflection = 'Conserving power lightens the grid load, cleaning the digital air.';
        projection = 'A stable grid keeps the canopy leaves lush, preserving natural digital cooling.';
      } else if (descLower.includes('vegan') || descLower.includes('diet') || descLower.includes('eat') || descLower.includes('meat')) {
        category = 'food';
        delta = 0.06;
        co2 = 100;
        reflection = 'A plant-based choice nurtures the planet and saves precious water resources.';
        projection = 'Sustainable food consumption reduces overall resource pressures, fostering a balanced sanctuary.';
      }

      analysis = {
        category,
        impact_type: isPositive ? 'positive' : 'degrading',
        vitality_delta: delta,
        co2_saved_g: co2,
        nature_reflection: reflection,
        future_projection_5y: projection,
      };
    }

    if (isSandbox) {
      // Offline/Sandbox mode: mock state transitions
      const currentScore = 0.6; // Mock initial score
      const delta = Number(analysis.vitality_delta);
      const newScore = Math.max(0.00, Math.min(1.00, currentScore + delta));

      let targetWeather = 'sunny';
      if (newScore < 0.3) {
        targetWeather = 'stormy';
      } else if (newScore < 0.5) {
        targetWeather = 'foggy';
      }

      const actionLog = {
        id: `mock-log-${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        raw_description: description,
        category: analysis.category,
        impact_type: analysis.impact_type,
        vitality_delta: delta,
        co2_saved_g: analysis.co2_saved_g,
        future_projection_5y: analysis.future_projection_5y,
        ai_metadata: analysis,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        actionLog,
        vitalityScore: newScore,
        weatherCondition: targetWeather,
        analysis: {
          natureReflection: analysis.nature_reflection,
          futureProjection5y: analysis.future_projection_5y,
        }
      });
    }

    // 4. Update Database within transaction (Action Log + State transition) for Real Supabase
    const client = supabase!;
    const { data: currentState, error: fetchError } = (await (client
      .from('ecosystem_states') as any)
      .select('vitality_score, tree_count, flower_count')
      .eq('user_id', user.id)
      .single()) as any;

    if (fetchError || !currentState) {
      return NextResponse.json({ error: 'Ecosystem state not found' }, { status: 404 });
    }

    const currentScore = Number(currentState.vitality_score);
    const delta = Number(analysis.vitality_delta);
    const newScore = Math.max(0.00, Math.min(1.00, currentScore + delta));

    // Determine target weather condition based on new score
    let targetWeather = 'sunny';
    if (newScore < 0.3) {
      targetWeather = 'stormy';
    } else if (newScore < 0.5) {
      targetWeather = 'foggy';
    }

    // Begin updates in Supabase
    const { data: actionLog, error: actionLogError } = (await (client
      .from('action_logs') as any)
      .insert({
        user_id: user.id,
        raw_description: description,
        category: analysis.category,
        impact_type: analysis.impact_type,
        vitality_delta: delta,
        co2_saved_g: analysis.co2_saved_g,
        future_projection_5y: analysis.future_projection_5y,
        ai_metadata: analysis,
      })
      .select()
      .single()) as any;

    if (actionLogError) {
      throw new Error(`Failed to write action log: ${actionLogError.message}`);
    }

    // Update ecosystem state
    const { error: stateUpdateError } = (await (client
      .from('ecosystem_states') as any)
      .update({
        vitality_score: newScore,
        weather_condition: targetWeather,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)) as any;

    if (stateUpdateError) {
      throw new Error(`Failed to update ecosystem state: ${stateUpdateError.message}`);
    }

    // 5. Return success payload
    return NextResponse.json({
      success: true,
      actionLog,
      vitalityScore: newScore,
      weatherCondition: targetWeather,
      analysis: {
        natureReflection: analysis.nature_reflection,
        futureProjection5y: analysis.future_projection_5y,
      }
    });

  } catch (error: any) {
    console.error('Error in analyze API Route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
