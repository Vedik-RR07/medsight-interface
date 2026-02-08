import type { AnalyzeResponse } from './api';

const STORAGE_KEY = 'medsight_recent_analyses';
const MAX_ANALYSES = 10;

export interface StoredAnalysis {
  id: string;
  timestamp: string;
  analysis: AnalyzeResponse;
}

/**
 * Save an analysis to session storage
 */
export function saveAnalysisToSession(analysis: AnalyzeResponse): void {
  try {
    const stored = getStoredAnalyses();
    
    const newAnalysis: StoredAnalysis = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      analysis,
    };
    
    // Add to beginning of array
    stored.unshift(newAnalysis);
    
    // Keep only the most recent MAX_ANALYSES
    const trimmed = stored.slice(0, MAX_ANALYSES);
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save analysis to session storage:', error);
  }
}

/**
 * Get all stored analyses from session storage
 */
export function getStoredAnalyses(): StoredAnalysis[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored) as StoredAnalysis[];
  } catch (error) {
    console.error('Failed to load analyses from session storage:', error);
    return [];
  }
}

/**
 * Clear all stored analyses
 */
export function clearStoredAnalyses(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored analyses:', error);
  }
}

/**
 * Get a specific analysis by ID
 */
export function getAnalysisById(id: string): StoredAnalysis | null {
  const analyses = getStoredAnalyses();
  return analyses.find(a => a.id === id) || null;
}
