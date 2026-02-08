import { supabase } from './supabase';
import type { AnalyzeResponse } from './api';

export interface SavedAnalysis {
  id: string;
  user_id: string;
  query: string;
  mode: string;
  patient_age?: number;
  patient_sex?: string;
  patient_condition?: string;
  safety_tier?: string;
  summary: string;
  confidence: number;
  created_at: string;
  full_results: AnalyzeResponse;
}

/**
 * Save an analysis result to the database
 */
export async function saveAnalysis(
  userId: string,
  analysis: AnalyzeResponse
): Promise<{ data: SavedAnalysis | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        query: analysis.query,
        mode: analysis.mode,
        patient_age: analysis.patientSafety ? (analysis as any).patient?.age : null,
        patient_sex: analysis.patientSafety ? (analysis as any).patient?.sex : null,
        patient_condition: analysis.patientSafety ? (analysis as any).patient?.primaryCondition : null,
        safety_tier: analysis.patientSafety?.safetyTier,
        summary: analysis.synthesis.summary,
        confidence: analysis.synthesis.overallConfidence,
        full_results: analysis,
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error saving analysis:', error);
    return { data: null, error };
  }
}

/**
 * Get recent analyses for a user
 */
export async function getRecentAnalyses(
  userId: string,
  limit: number = 10
): Promise<{ data: SavedAnalysis[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return { data: null, error };
  }
}

/**
 * Get a specific analysis by ID
 */
export async function getAnalysisById(
  id: string
): Promise<{ data: SavedAnalysis | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return { data: null, error };
  }
}

/**
 * Delete an analysis
 */
export async function deleteAnalysis(
  id: string
): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id);

    return { error };
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return { error };
  }
}
