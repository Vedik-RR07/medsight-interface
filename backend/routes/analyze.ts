import { Router, Request, Response } from "express";
import { runAnalyzePipeline } from "../analyzePipeline.js";
import type { AnalyzeRequestBody, PatientParams, PatientProfile, AnalysisMode } from "../types.js";

type AnalyzeBody = Partial<AnalyzeRequestBody>;

const router = Router();

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const body = req.body as AnalyzeBody;
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (!query) {
      res.status(400).json({ error: "Missing or invalid 'query' in request body." });
      return;
    }

    // Extract and validate mode
    const mode: AnalysisMode = body?.mode === 'clinical' || body?.mode === 'research' 
      ? body.mode 
      : 'research'; // Default to research mode for backwards compatibility

    // Extract patient profile (new format)
    let patient: PatientProfile | undefined;
    if (body?.patient && typeof body.patient === "object") {
      const p = body.patient as any; // Use any to avoid type conversion issues
      
      // New PatientProfile format
      if (typeof p.age === 'number' || typeof p.sex === 'string' || typeof p.primaryCondition === 'string') {
        patient = {
          age: typeof p.age === 'number' ? p.age : 0,
          sex: (p.sex === 'male' || p.sex === 'female' || p.sex === 'other') ? p.sex : 'other',
          primaryCondition: typeof p.primaryCondition === 'string' ? p.primaryCondition : '',
          comorbidities: Array.isArray(p.comorbidities) ? p.comorbidities.filter((c: any): c is string => typeof c === "string") : undefined,
          medications: Array.isArray(p.medications) ? p.medications.filter((m: any): m is string => typeof m === "string") : undefined,
        };
      }
      // Legacy PatientParams format (for backwards compatibility)
      else if (p.ageRange || p.condition) {
        // Convert legacy format to new format
        const ageRange = p.ageRange as any;
        const avgAge = ageRange ? ((ageRange.min as number || 0) + (ageRange.max as number || 100)) / 2 : 50;
        
        patient = {
          age: Math.round(avgAge),
          sex: typeof p.sex === 'string' ? (p.sex as any) : 'other',
          primaryCondition: typeof p.condition === 'string' ? p.condition : 'unspecified',
          comorbidities: Array.isArray(p.comorbidities) ? p.comorbidities.filter((c: any): c is string => typeof c === "string") : undefined,
        };
      }
    }

    // Run pipeline with mode and patient
    const result = await runAnalyzePipeline(query, mode, patient);
    res.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    
    // Check if it's a validation error (400) or server error (500)
    const isValidationError = err instanceof Error && (
      err.message.includes('required in clinical mode') ||
      err.message.includes('Invalid mode') ||
      err.message.includes('must be between')
    );
    
    res.status(isValidationError ? 400 : 500).json({
      error: err instanceof Error ? err.message : "Analysis failed.",
    });
  }
});

export default router;
