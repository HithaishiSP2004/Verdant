// Auto-compatible TypeScript types for Supabase PostgreSQL database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      community_ecosystems: {
        Row: {
          id: string;
          name: string;
          vitality_score: number;
          total_members: number;
          created_at: string;
        }
        Insert: {
          id?: string;
          name: string;
          vitality_score?: number;
          total_members?: number;
          created_at?: string;
        }
        Update: {
          id?: string;
          name?: string;
          vitality_score?: number;
          total_members?: number;
          created_at?: string;
        }
      }
      ecosystem_states: {
        Row: {
          user_id: string;
          vitality_score: number;
          guardian_archetype: string | null;
          ecosystem_personality: string | null;
          growth_story: string | null;
          tree_count: number;
          flower_count: number;
          weather_condition: string;
          updated_at: string;
        }
        Insert: {
          user_id: string;
          vitality_score?: number;
          guardian_archetype?: string | null;
          ecosystem_personality?: string | null;
          growth_story?: string | null;
          tree_count?: number;
          flower_count?: number;
          weather_condition?: string;
          updated_at?: string;
        }
        Update: {
          user_id?: string;
          vitality_score?: number;
          guardian_archetype?: string | null;
          ecosystem_personality?: string | null;
          growth_story?: string | null;
          tree_count?: number;
          flower_count?: number;
          weather_condition?: string;
          updated_at?: string;
        }
      }
      action_logs: {
        Row: {
          id: string;
          user_id: string;
          raw_description: string;
          category: string;
          impact_type: string;
          vitality_delta: number;
          co2_saved_g: number;
          future_projection_5y: string;
          ai_metadata: Json | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          raw_description: string;
          category: string;
          impact_type: string;
          vitality_delta: number;
          co2_saved_g?: number;
          future_projection_5y: string;
          ai_metadata?: Json | null;
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          raw_description?: string;
          category?: string;
          impact_type?: string;
          vitality_delta?: number;
          co2_saved_g?: number;
          future_projection_5y?: string;
          ai_metadata?: Json | null;
          created_at?: string;
        }
      }
      ecosystem_assets: {
        Row: {
          id: string;
          user_id: string;
          asset_type: string;
          pos_x: number;
          pos_y: number;
          pos_z: number;
          scale: number;
          health_state: number;
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          asset_type: string;
          pos_x: number;
          pos_y: number;
          pos_z: number;
          scale?: number;
          health_state?: number;
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          asset_type?: string;
          pos_x?: number;
          pos_y?: number;
          pos_z?: number;
          scale?: number;
          health_state?: number;
          created_at?: string;
        }
      }
      community_members: {
        Row: {
          community_id: string;
          user_id: string;
          joined_at: string;
        }
        Insert: {
          community_id: string;
          user_id: string;
          joined_at?: string;
        }
        Update: {
          community_id?: string;
          user_id?: string;
          joined_at?: string;
        }
      }
    }
  }
}
