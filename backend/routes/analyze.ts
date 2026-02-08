import { Router, Request, Response } from "express";
import { runAnalyzePipeline } from "../analyzePipeline.js";
import type { AnalyzeRequestBody, PatientParams } from "../types.js";

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
    let patient: PatientParams | undefined;
    if (body?.patient && typeof body.patient === "object") {
      const p = body.patient as Record<string, unknown>;
      patient = {};
      if (p.ageRange && typeof p.ageRange === "object") {
        const ar = p.ageRange as Record<string, unknown>;
        if (typeof ar.min === "number") patient.ageRange = { ...patient.ageRange, min: ar.min };
        if (typeof ar.max === "number") patient.ageRange = { ...patient.ageRange, max: ar.max };
      }
      if (typeof p.sex === "string") patient.sex = p.sex;
      if (typeof p.condition === "string") patient.condition = p.condition;
      if (Array.isArray(p.comorbidities)) patient.comorbidities = p.comorbidities.filter((c): c is string => typeof c === "string");
    }

    const result = await runAnalyzePipeline(query, patient);
    res.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Analysis failed.",
    });
  }
});

export default router;
