-- Initial Schema Migration for VERDANT
-- Creates tables for User Ecosystem States, Action Logs, and 3D Assets

-- Enable extension for random uuid generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. ECOSYSTEM STATES TABLE (Extends Auth.Users)
CREATE TABLE public.ecosystem_states (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    vitality_score NUMERIC(3, 2) NOT NULL DEFAULT 0.50 CHECK (vitality_score >= 0.00 AND vitality_score <= 1.00),
    guardian_archetype TEXT CHECK (guardian_archetype IN ('Forest Guardian', 'River Protector', 'Mountain Keeper', 'Pollinator Ally', 'Sun Keeper')),
    ecosystem_personality TEXT,
    growth_story TEXT,
    tree_count INTEGER NOT NULL DEFAULT 5,
    flower_count INTEGER NOT NULL DEFAULT 2,
    weather_condition TEXT NOT NULL DEFAULT 'sunny' CHECK (weather_condition IN ('sunny', 'foggy', 'rainy', 'stormy')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ACTION LOGS TABLE
CREATE TABLE public.action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    raw_description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('transportation', 'energy', 'waste', 'food', 'conservation')),
    impact_type TEXT NOT NULL CHECK (impact_type IN ('positive', 'negative')),
    vitality_delta NUMERIC(3, 2) NOT NULL,
    co2_saved_g NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    future_projection_5y TEXT NOT NULL,
    ai_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ECOSYSTEM ASSETS TABLE (3D visual coordinates inside user's R3F viewport)
CREATE TABLE public.ecosystem_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('oak', 'pine', 'flower', 'withered_log')),
    pos_x NUMERIC(6, 3) NOT NULL,
    pos_y NUMERIC(6, 3) NOT NULL,
    pos_z NUMERIC(6, 3) NOT NULL,
    scale NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    health_state NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (health_state >= 0.00 AND health_state <= 1.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES --

ALTER TABLE public.ecosystem_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystem_assets ENABLE ROW LEVEL SECURITY;

-- 1. Ecosystem States Policies
CREATE POLICY "Users can view their own ecosystem state"
    ON public.ecosystem_states FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own ecosystem state"
    ON public.ecosystem_states FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert ecosystem states on signup"
    ON public.ecosystem_states FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 2. Action Logs Policies
CREATE POLICY "Users can view their own action logs"
    ON public.action_logs FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own action logs"
    ON public.action_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3. Ecosystem Assets Policies
CREATE POLICY "Users can view their own assets"
    ON public.ecosystem_assets FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own assets"
    ON public.ecosystem_assets FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- TRIGGERS & PROCEDURES --

-- Trigger to create initial profile assets on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert state
  INSERT INTO public.ecosystem_states (
    user_id, 
    vitality_score, 
    guardian_archetype, 
    ecosystem_personality, 
    growth_story,
    tree_count, 
    flower_count, 
    weather_condition
  )
  VALUES (
    new.id, 
    0.50, 
    'Forest Guardian', 
    'The soil lies quiet, waiting for the first signs of conscious action to stir the canopy.',
    'A new sanctuary is born. The initial roots have set hold.',
    5, 
    2, 
    'sunny'
  );
  
  -- Spawn baseline 3D meshes in the ecosystem
  INSERT INTO public.ecosystem_assets (user_id, asset_type, pos_x, pos_y, pos_z, scale, health_state)
  VALUES 
    (new.id, 'oak', -2.500, 0.000, -2.500, 1.00, 1.00),
    (new.id, 'oak', 2.000, 0.000, -1.800, 0.90, 1.00),
    (new.id, 'pine', 0.000, 0.000, -3.500, 1.25, 1.00),
    (new.id, 'flower', -1.200, 0.000, -1.000, 0.80, 1.00),
    (new.id, 'flower', 1.500, 0.000, -0.900, 1.10, 1.00);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Trigger definition (binds the handle_new_user procedure to auth.users insertions)
-- This runs automatically in production when users confirm signup.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
