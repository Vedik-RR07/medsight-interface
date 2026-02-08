# Requirements Document: Safety-First Clinical Mode

## Introduction

This specification transforms MedSight from a research summarization tool into a safety-first "Clinician's Shield" clinical decision support system. The system will enforce patient-specific analysis, detect contraindications and population mismatches, veto unsafe recommendations, surface uncertainty and disagreement explicitly, and require recommendations to be justified in light of objections.

The transformation prioritizes patient safety above all else, implementing a multi-agent critique system where agents can veto unsafe recommendations and force explicit justification of clinical decisions. The system operates in two modes: a strict "clinical" mode requiring complete patient profiles and safety analysis, and a permissive "research" mode for general evidence exploration.

## Glossary

- **Clinical_Mode**: Operating mode requiring complete patient profiles and enforcing safety analysis with veto capability
- **Research_Mode**: Operating mode allowing optional patient data and providing informational warnings without veto
- **PatientProfile**: Required structured data containing patient demographics, conditions, and comorbidities
- **PatientSafetyAgent**: Upgraded agent that scans for contraindications, exclusion criteria, and demographic gaps
- **SafetyTier**: Classification of recommendation safety: safe, caution, not-recommended, or contraindicated
- **AgentVeto**: Mechanism allowing safety or quality agents to block unsafe recommendations
- **SynthesisAgent**: Final agent that must defend recommendations against all objections
- **ClinicalAlert**: Explicit warning about contraindications, exclusions, or safety concerns
- **DemographicGap**: Mismatch between patient characteristics and study populations
- **AnalysisPipeline**: Sequential execution of agents with veto checkpoints
- **MedSight**: The clinical decision support system being transformed
- **TrialQualityAgent**: Agent assessing study design quality and bias risk
- **StatisticsAgent**: Agent evaluating statistical strength of evidence
- **LiteratureAgent**: Agent ranking papers by relevance
- **Backend**: TypeScript server implementing agent logic and API routes
- **Frontend**: React TypeScript UI displaying results and safety information

## Requirements

### Requirement 1: Operating Mode Selection

**User Story:** As a clinician, I want to specify whether I'm performing clinical decision support or research exploration, so that the system applies appropriate safety constraints.

#### Acceptance Criteria

1. WHEN a user initiates an analysis request, THE System SHALL accept a mode parameter with values "clinical" or "research"
2. WHEN mode is set to "clinical", THE System SHALL enforce all safety requirements including mandatory patient profiles and veto logic
3. WHEN mode is set to "research", THE System SHALL allow optional patient data and provide informational warnings without blocking recommendations
4. THE Backend SHALL validate the mode parameter and reject requests with invalid mode values
5. THE Frontend SHALL provide clear UI controls for mode selection with explanations of each mode's behavior

### Requirement 2: Mandatory Patient Profile in Clinical Mode

**User Story:** As a clinician, I want the system to require complete patient information in clinical mode, so that recommendations are always personalized and safety-checked.

#### Acceptance Criteria

1. WHEN mode is "clinical", THE System SHALL require a complete PatientProfile object in the analysis request
2. THE PatientProfile SHALL contain mandatory fields: age (number), sex (string), and primaryCondition (string)
3. THE PatientProfile MAY contain optional fields: comorbidities (array of strings) and medications (array of strings)
4. WHEN a clinical mode request lacks a PatientProfile or has incomplete required fields, THE System SHALL reject the request with a descriptive error
5. WHEN mode is "research", THE System SHALL accept requests with optional or missing patient data
6. THE Backend SHALL update type definitions to replace optional PatientParams with required PatientProfile for clinical mode
7. THE Frontend SHALL validate patient profile completeness before submitting clinical mode requests

### Requirement 3: Patient Safety Agent with Contraindication Detection

**User Story:** As a clinician, I want the system to scan literature for contraindications and exclusion criteria specific to my patient, so that I'm warned about potentially unsafe treatments.

#### Acceptance Criteria

1. THE System SHALL rename patientMatchAgent to patientSafetyAgent
2. WHEN analyzing papers, THE PatientSafetyAgent SHALL scan abstracts and titles for explicit exclusion criteria matching the patient profile
3. WHEN analyzing papers, THE PatientSafetyAgent SHALL identify contraindications based on age, sex, condition, comorbidities, and medications
4. WHEN analyzing papers, THE PatientSafetyAgent SHALL detect demographic gaps where study populations differ significantly from the patient
5. THE PatientSafetyAgent SHALL assign a SafetyTier classification: "safe", "caution", "not-recommended", or "contraindicated"
6. THE PatientSafetyAgent SHALL generate a list of ClinicalAlerts describing specific safety concerns
7. THE PatientSafetyAgent SHALL identify exclusionMatches listing which exclusion criteria from studies match the patient
8. THE PatientSafetyAgent SHALL document demographicGaps explaining population mismatches
9. THE PatientSafetyAgent SHALL suggest alternativeOptions when recommendations are unsafe
10. THE PatientSafetyAgent SHALL produce a plain-language summary suitable for clinician review
11. THE PatientSafetyAgent SHALL generate questions for the clinician to consider

### Requirement 4: Safety Tier Classification System

**User Story:** As a clinician, I want clear safety classifications for recommendations, so that I can quickly assess risk levels.

#### Acceptance Criteria

1. THE PatientSafetyAgent SHALL classify every analysis with exactly one SafetyTier value
2. WHEN no contraindications or significant demographic gaps exist, THE PatientSafetyAgent SHALL assign SafetyTier "safe"
3. WHEN minor demographic gaps or limited evidence exist, THE PatientSafetyAgent SHALL assign SafetyTier "caution"
4. WHEN significant demographic mismatches or concerning evidence patterns exist, THE PatientSafetyAgent SHALL assign SafetyTier "not-recommended"
5. WHEN explicit contraindications or exclusion criteria match the patient, THE PatientSafetyAgent SHALL assign SafetyTier "contraindicated"
6. THE System SHALL include SafetyTier in the PatientSafetyAgent output
7. THE System SHALL pass SafetyTier to downstream agents for veto logic

### Requirement 5: Agent Veto Logic for Unsafe Recommendations

**User Story:** As a patient safety officer, I want the system to block recommendations when safety agents identify contraindications, so that clinicians never receive unsafe suggestions.

#### Acceptance Criteria

1. WHEN SafetyTier is "contraindicated", THE AnalysisPipeline SHALL trigger a hard veto preventing recommendation generation
2. WHEN SafetyTier is "not-recommended", THE AnalysisPipeline SHALL trigger a soft veto requiring explicit justification
3. WHEN a hard veto is triggered, THE SynthesisAgent SHALL output "Do Not Proceed" as the recommendation with full safety reasoning
4. WHEN a soft veto is triggered, THE SynthesisAgent SHALL justify why evidence might still be considered despite concerns
5. WHEN TrialQualityAgent identifies high bias risk, THE AnalysisPipeline SHALL downgrade confidence and pass objections to SynthesisAgent
6. WHEN StatisticsAgent identifies weak statistical evidence, THE AnalysisPipeline SHALL downgrade confidence and pass objections to SynthesisAgent
7. THE AnalysisPipeline SHALL collect all agent objections and pass them to SynthesisAgent for response
8. THE System SHALL not allow SynthesisAgent to override hard vetoes from PatientSafetyAgent

### Requirement 6: Synthesis Agent Defense of Recommendations

**User Story:** As a clinician, I want to see how the system addresses safety concerns and conflicting evidence, so that I understand the reasoning behind recommendations.

#### Acceptance Criteria

1. THE SynthesisAgent SHALL receive all agent outputs including safety objections, quality concerns, and statistical weaknesses
2. THE SynthesisAgent SHALL list supporting evidence for any recommendation
3. THE SynthesisAgent SHALL list contradicting evidence and safety objections
4. THE SynthesisAgent SHALL explicitly respond to each objection with reasoning
5. WHEN evidence is insufficient or contradictory, THE SynthesisAgent SHALL output "Evidence insufficient for recommendation"
6. WHEN safety concerns exist, THE SynthesisAgent SHALL output "Recommendation unsafe for this patient" with detailed reasoning
7. THE SynthesisAgent SHALL produce a clinician-facing summary with technical details
8. THE SynthesisAgent SHALL produce a patient-facing explanation in plain language
9. THE SynthesisAgent SHALL include confidence level with explicit justification for the confidence score
10. THE SynthesisAgent SHALL document bias concerns, data gaps, and uncertainty explicitly

### Requirement 7: Safety-First Results Presentation

**User Story:** As a clinician, I want safety information displayed prominently in the UI, so that I immediately see risks before considering recommendations.

#### Acceptance Criteria

1. WHEN displaying results, THE Frontend SHALL show the SafetyTier banner as the first visible element
2. WHEN SafetyTier is "contraindicated", THE Frontend SHALL display a red banner with prominent warning iconography
3. WHEN SafetyTier is "not-recommended", THE Frontend SHALL display an orange banner with caution iconography
4. WHEN SafetyTier is "caution", THE Frontend SHALL display a yellow banner with information iconography
5. WHEN SafetyTier is "safe", THE Frontend SHALL display a green banner with confirmation iconography
6. WHEN SafetyTier is "contraindicated" or "not-recommended", THE Frontend SHALL visually suppress or hide recommendation sections
7. THE Frontend SHALL display ClinicalAlerts in a dedicated, prominent section
8. THE Frontend SHALL explain DemographicGaps in plain language with visual indicators
9. THE Frontend SHALL provide a plain-language explanation section suitable for patient discussion
10. THE Frontend SHALL display alternativeOptions when provided by PatientSafetyAgent
11. THE Frontend SHALL show the SynthesisAgent's response to objections in an expandable section

### Requirement 8: Contraindication and Exclusion Matching

**User Story:** As a clinician, I want to know if my patient matches any exclusion criteria from the studies, so that I can assess applicability of the evidence.

#### Acceptance Criteria

1. WHEN analyzing papers, THE PatientSafetyAgent SHALL extract explicit exclusion criteria from abstracts
2. WHEN patient age falls outside study age ranges, THE PatientSafetyAgent SHALL flag an age-based exclusion match
3. WHEN patient sex differs from study populations, THE PatientSafetyAgent SHALL flag a sex-based demographic gap
4. WHEN patient comorbidities match study exclusion criteria, THE PatientSafetyAgent SHALL flag comorbidity-based exclusion matches
5. WHEN patient medications interact with study interventions, THE PatientSafetyAgent SHALL flag medication-based contraindications
6. THE PatientSafetyAgent SHALL provide specific citations for each exclusion match
7. THE PatientSafetyAgent SHALL distinguish between absolute contraindications and relative cautions

### Requirement 9: Demographic Gap Analysis

**User Story:** As a clinician, I want to understand how my patient's demographics differ from study populations, so that I can assess generalizability of findings.

#### Acceptance Criteria

1. WHEN patient age differs from study population age ranges by more than 10 years, THE PatientSafetyAgent SHALL flag an age demographic gap
2. WHEN patient sex is underrepresented in study populations (less than 30% of participants), THE PatientSafetyAgent SHALL flag a sex demographic gap
3. WHEN patient has comorbidities not represented in study populations, THE PatientSafetyAgent SHALL flag a comorbidity demographic gap
4. WHEN study populations are predominantly from different geographic regions, THE PatientSafetyAgent SHALL flag a geographic demographic gap
5. THE PatientSafetyAgent SHALL quantify the severity of each demographic gap (minor, moderate, severe)
6. THE PatientSafetyAgent SHALL explain the potential impact of each demographic gap on recommendation applicability

### Requirement 10: Alternative Options Suggestion

**User Story:** As a clinician, I want the system to suggest alternatives when a recommendation is unsafe, so that I have actionable next steps.

#### Acceptance Criteria

1. WHEN SafetyTier is "contraindicated" or "not-recommended", THE PatientSafetyAgent SHALL attempt to identify alternative interventions from the literature
2. THE PatientSafetyAgent SHALL suggest consulting specialists when evidence is limited for the patient's demographic
3. THE PatientSafetyAgent SHALL recommend additional diagnostic tests when uncertainty is high
4. THE PatientSafetyAgent SHALL suggest modified treatment approaches when demographic gaps exist
5. THE PatientSafetyAgent SHALL provide rationale for each alternative option

### Requirement 11: Confidence Justification

**User Story:** As a clinician, I want to understand why the system assigns specific confidence levels, so that I can assess the reliability of recommendations.

#### Acceptance Criteria

1. THE SynthesisAgent SHALL provide explicit reasoning for the overallConfidence score
2. THE SynthesisAgent SHALL explain how trial quality affects confidence
3. THE SynthesisAgent SHALL explain how statistical strength affects confidence
4. THE SynthesisAgent SHALL explain how patient match affects confidence
5. THE SynthesisAgent SHALL explain how disagreement between agents affects confidence
6. WHEN confidence is downgraded due to vetoes or objections, THE SynthesisAgent SHALL explicitly state the reasons

### Requirement 12: Bias and Uncertainty Surfacing

**User Story:** As a clinician, I want the system to explicitly highlight bias and uncertainty in the evidence, so that I can make informed decisions.

#### Acceptance Criteria

1. THE SynthesisAgent SHALL list all sources of bias identified by TrialQualityAgent
2. THE SynthesisAgent SHALL describe uncertainty in effect sizes and outcomes
3. THE SynthesisAgent SHALL highlight conflicting results between studies
4. THE SynthesisAgent SHALL identify gaps in the evidence base
5. THE SynthesisAgent SHALL distinguish between statistical uncertainty and clinical uncertainty
6. THE SynthesisAgent SHALL provide context for how bias and uncertainty affect the recommendation

### Requirement 13: Backend Type System Updates

**User Story:** As a developer, I want updated type definitions that reflect the new safety-first architecture, so that the codebase is type-safe and maintainable.

#### Acceptance Criteria

1. THE Backend SHALL define a PatientProfile interface with required fields: age, sex, primaryCondition
2. THE Backend SHALL define a PatientProfile interface with optional fields: comorbidities, medications
3. THE Backend SHALL define a SafetyTier type with values: "safe", "caution", "not-recommended", "contraindicated"
4. THE Backend SHALL define a PatientSafetyAgentOutput interface replacing PatientMatchAgentOutput
5. THE PatientSafetyAgentOutput SHALL include: safetyTier, clinicalAlerts, exclusionMatches, demographicGaps, alternativeOptions, plainLanguageSummary, questionsForClinician
6. THE Backend SHALL define an AnalysisMode type with values: "clinical", "research"
7. THE Backend SHALL update AnalyzeRequestBody to include mode and conditionally require PatientProfile
8. THE Backend SHALL update AnalyzeResponse to include PatientSafetyAgentOutput instead of PatientMatchAgentOutput
9. THE Backend SHALL update SynthesisAgentOutput to include: supportingEvidence, contradictingEvidence, objectionResponses, clinicianSummary, patientExplanation

### Requirement 14: Pipeline Veto Implementation

**User Story:** As a developer, I want the analysis pipeline to implement veto logic, so that unsafe recommendations are blocked at the system level.

#### Acceptance Criteria

1. THE AnalysisPipeline SHALL execute PatientSafetyAgent before SynthesisAgent
2. WHEN PatientSafetyAgent returns SafetyTier "contraindicated", THE AnalysisPipeline SHALL set a hard veto flag
3. WHEN PatientSafetyAgent returns SafetyTier "not-recommended", THE AnalysisPipeline SHALL set a soft veto flag
4. THE AnalysisPipeline SHALL collect objections from TrialQualityAgent and StatisticsAgent
5. THE AnalysisPipeline SHALL pass veto flags and all objections to SynthesisAgent
6. WHEN a hard veto is active, THE SynthesisAgent SHALL not generate a positive recommendation
7. THE AnalysisPipeline SHALL include veto status in the response for frontend display

### Requirement 15: Frontend Mode Selection UI

**User Story:** As a user, I want clear controls for selecting clinical or research mode, so that I understand what constraints apply to my analysis.

#### Acceptance Criteria

1. THE Frontend SHALL provide a mode selector with "Clinical Mode" and "Research Mode" options
2. THE Frontend SHALL display a description of Clinical Mode: "Requires complete patient profile. Enforces safety checks and may veto unsafe recommendations."
3. THE Frontend SHALL display a description of Research Mode: "Optional patient data. Provides informational warnings without blocking recommendations."
4. WHEN Clinical Mode is selected, THE Frontend SHALL show required patient profile fields
5. WHEN Research Mode is selected, THE Frontend SHALL show optional patient profile fields
6. THE Frontend SHALL validate patient profile completeness before allowing clinical mode submission
7. THE Frontend SHALL display the selected mode in the results view

### Requirement 16: Frontend Safety Banner Display

**User Story:** As a clinician, I want immediate visual feedback about safety status, so that I can quickly assess risk before reading details.

#### Acceptance Criteria

1. THE Frontend SHALL render the safety banner at the top of the results page above all other content
2. WHEN SafetyTier is "contraindicated", THE Frontend SHALL use red background color (e.g., bg-red-100 border-red-500)
3. WHEN SafetyTier is "not-recommended", THE Frontend SHALL use orange background color (e.g., bg-orange-100 border-orange-500)
4. WHEN SafetyTier is "caution", THE Frontend SHALL use yellow background color (e.g., bg-yellow-100 border-yellow-500)
5. WHEN SafetyTier is "safe", THE Frontend SHALL use green background color (e.g., bg-green-100 border-green-500)
6. THE Frontend SHALL include appropriate icons for each safety tier (e.g., AlertTriangle, AlertCircle, Info, CheckCircle)
7. THE Frontend SHALL display the safety tier label prominently in the banner
8. THE Frontend SHALL include a brief summary of safety concerns in the banner

### Requirement 17: Clinical Alerts Display

**User Story:** As a clinician, I want to see all safety alerts in one place, so that I can review all concerns before making decisions.

#### Acceptance Criteria

1. THE Frontend SHALL create a dedicated "Clinical Alerts" section below the safety banner
2. THE Frontend SHALL display each clinical alert as a separate item with clear visual separation
3. THE Frontend SHALL use warning iconography for each alert
4. THE Frontend SHALL include the alert text and supporting evidence citations
5. WHEN no clinical alerts exist, THE Frontend SHALL display "No specific clinical alerts identified"
6. THE Frontend SHALL make the clinical alerts section collapsible but expanded by default

### Requirement 18: Recommendation Suppression for Unsafe Cases

**User Story:** As a patient safety officer, I want unsafe recommendations to be visually suppressed or hidden, so that clinicians don't accidentally act on contraindicated advice.

#### Acceptance Criteria

1. WHEN SafetyTier is "contraindicated", THE Frontend SHALL hide or gray out the recommendation section
2. WHEN SafetyTier is "contraindicated", THE Frontend SHALL display "Recommendation Withheld Due to Safety Concerns" instead of the recommendation
3. WHEN SafetyTier is "not-recommended", THE Frontend SHALL display the recommendation with prominent warning borders and reduced visual emphasis
4. WHEN SafetyTier is "caution" or "safe", THE Frontend SHALL display the recommendation normally
5. THE Frontend SHALL always display the SynthesisAgent's reasoning regardless of safety tier

### Requirement 19: Plain Language Explanations

**User Story:** As a clinician, I want plain-language explanations suitable for patient discussions, so that I can communicate findings effectively.

#### Acceptance Criteria

1. THE Frontend SHALL include a "Patient Explanation" section with plain-language content
2. THE PatientSafetyAgent SHALL generate plain-language summaries avoiding medical jargon
3. THE SynthesisAgent SHALL generate patient-facing explanations of recommendations
4. THE Frontend SHALL provide a "Copy for Patient" button to easily share explanations
5. THE Frontend SHALL clearly distinguish between clinician-facing and patient-facing content

### Requirement 20: Backwards Compatibility for Research Mode

**User Story:** As a researcher, I want to continue using MedSight for general evidence exploration without strict safety requirements, so that I can perform exploratory analyses.

#### Acceptance Criteria

1. WHEN mode is "research", THE System SHALL accept requests with optional or missing patient data
2. WHEN mode is "research", THE PatientSafetyAgent SHALL provide informational warnings without triggering vetoes
3. WHEN mode is "research", THE SynthesisAgent SHALL generate recommendations even with safety concerns, but include warnings
4. WHEN mode is "research", THE Frontend SHALL display safety information as informational rather than blocking
5. THE System SHALL maintain API compatibility for existing research-focused clients

### Requirement 21: Error Handling for Incomplete Patient Profiles

**User Story:** As a user, I want clear error messages when my patient profile is incomplete in clinical mode, so that I know what information to provide.

#### Acceptance Criteria

1. WHEN a clinical mode request lacks the age field, THE Backend SHALL return an error: "Patient age is required in clinical mode"
2. WHEN a clinical mode request lacks the sex field, THE Backend SHALL return an error: "Patient sex is required in clinical mode"
3. WHEN a clinical mode request lacks the primaryCondition field, THE Backend SHALL return an error: "Patient primary condition is required in clinical mode"
4. THE Backend SHALL return HTTP 400 status code for incomplete patient profile errors
5. THE Frontend SHALL display validation errors inline on the patient profile form
6. THE Frontend SHALL prevent form submission until all required fields are completed in clinical mode

### Requirement 22: Agent Output Logging and Traceability

**User Story:** As a compliance officer, I want all agent decisions and vetoes logged, so that we can audit the system's safety decisions.

#### Acceptance Criteria

1. THE Backend SHALL log when PatientSafetyAgent assigns each SafetyTier value
2. THE Backend SHALL log all veto triggers with reasoning
3. THE Backend SHALL log all agent objections passed to SynthesisAgent
4. THE Backend SHALL include timestamps and request identifiers in all logs
5. THE Backend SHALL log the final recommendation and confidence scores
6. THE Backend SHALL make logs accessible for audit and review

### Requirement 23: Testing Scenarios for Safety Logic

**User Story:** As a QA engineer, I want comprehensive test scenarios for safety logic, so that I can verify the system blocks unsafe recommendations correctly.

#### Acceptance Criteria

1. THE System SHALL be tested with a contraindicated patient scenario (e.g., pediatric patient for adult-only treatment)
2. THE System SHALL be tested with a demographic mismatch scenario (e.g., elderly patient with studies on young adults)
3. THE System SHALL be tested with a good match scenario (e.g., patient matching study populations)
4. THE System SHALL be tested with research mode allowing missing patient data
5. THE System SHALL be tested with multiple concurrent safety concerns
6. THE System SHALL be tested with edge cases like missing abstracts or incomplete study data
7. Each test SHALL verify correct SafetyTier assignment, veto behavior, and UI display

### Requirement 24: Performance Requirements for Safety Analysis

**User Story:** As a clinician, I want safety analysis to complete quickly, so that I can make timely decisions.

#### Acceptance Criteria

1. WHEN analyzing up to 20 papers, THE PatientSafetyAgent SHALL complete analysis within 5 seconds
2. WHEN analyzing up to 20 papers, THE complete AnalysisPipeline SHALL complete within 30 seconds
3. THE System SHALL process safety checks in parallel with other agent analyses where possible
4. THE System SHALL cache patient profile validation results to avoid redundant checks
5. THE Frontend SHALL display loading indicators during safety analysis

### Requirement 25: Documentation for Clinical Mode Usage

**User Story:** As a new user, I want clear documentation on how to use clinical mode, so that I can operate the system safely and effectively.

#### Acceptance Criteria

1. THE System SHALL provide user documentation explaining clinical vs research mode
2. THE Documentation SHALL include examples of complete patient profiles
3. THE Documentation SHALL explain each SafetyTier and what it means
4. THE Documentation SHALL describe how vetoes work and when recommendations are blocked
5. THE Documentation SHALL include best practices for interpreting safety alerts
6. THE Documentation SHALL clarify that the system is a decision support tool, not a replacement for clinical judgment
