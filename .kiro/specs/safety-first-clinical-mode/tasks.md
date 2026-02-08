# Implementation Plan: Safety-First Clinical Mode

## Overview

This implementation transforms MedSight into a safety-first clinical decision support system by introducing dual operating modes (clinical/research), mandatory patient profiling, contraindication detection, agent veto logic, and safety-first UI presentation. The implementation follows an incremental approach: backend type system updates, agent refactoring, pipeline veto logic, frontend safety displays, and comprehensive testing.

## Tasks

- [x] 1. Update backend type system for safety-first architecture
  - Create new type definitions in `backend/types.ts`
  - Define `AnalysisMode`, `SafetyTier`, `PatientProfile`, `ClinicalAlert`, `ExclusionMatch`, `DemographicGap`, `Objection`, `VetoStatus`
  - Update `PatientSafetyAgentOutput` interface (replacing `PatientMatchAgentOutput`)
  - Update `SynthesisAgentOutput` with new fields for defense and justification
  - Update `AnalyzeRequestBody` to include `mode` and conditionally require `PatientProfile`
  - Update `AnalyzeResponse` to include `PatientSafetyAgentOutput` and `VetoStatus`
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9_

- [ ]* 1.1 Write property tests for type validation
  - **Property 23: PatientProfile structure validation**
  - **Validates: Requirements 13.1, 13.2**

- [ ] 2. Implement request validation logic
  - [x] 2.1 Create validation module in `backend/analyzePipeline.ts`
    - Implement `validateRequest(mode, patient)` function
    - Validate mode parameter accepts only "clinical" or "research"
    - Validate clinical mode requires complete PatientProfile
    - Validate research mode accepts optional patient data
    - Return descriptive error messages for validation failures
    - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.4, 21.1, 21.2, 21.3, 21.4_
  
  - [ ]* 2.2 Write property tests for validation logic
    - **Property 1: Mode parameter validation**
    - **Validates: Requirements 1.1, 1.4**
    - **Property 2: Clinical mode patient profile requirement**
    - **Validates: Requirements 2.1, 2.2, 2.4, 21.1, 21.2, 21.3, 21.4**
    - **Property 3: Research mode permissiveness**
    - **Validates: Requirements 1.3, 2.5, 20.1**
    - **Property 4: Optional field acceptance**
    - **Validates: Requirements 2.3**

- [ ] 3. Refactor PatientMatchAgent to PatientSafetyAgent
  - [x] 3.1 Rename and restructure agent file
    - Rename `backend/agents/patientMatchAgent.ts` to `backend/agents/patientSafetyAgent.ts`
    - Update function signature to accept `PatientProfile` and `AnalysisMode`
    - Update return type to `PatientSafetyAgentOutput`
    - _Requirements: 3.1_
  
  - [x] 3.2 Implement contraindication detection logic
    - Parse abstracts for explicit exclusion criteria using LLM
    - Match patient age against study age ranges
    - Match patient sex against study populations
    - Match patient comorbidities against exclusion criteria
    - Generate `ClinicalAlert` objects for each contraindication
    - Generate `ExclusionMatch` objects with citations
    - _Requirements: 3.2, 3.3, 8.1, 8.2, 8.3, 8.4, 8.6, 8.7_
  
  - [x] 3.3 Implement demographic gap analysis
    - Calculate age differences between patient and study populations
    - Calculate sex representation in studies
    - Identify missing comorbidity representation
    - Generate `DemographicGap` objects with severity classification
    - Quantify severity as minor, moderate, or severe
    - Provide impact explanations for each gap
    - _Requirements: 3.4, 9.1, 9.2, 9.3, 9.5, 9.6_
  
  - [x] 3.4 Implement safety tier classification
    - Assign "contraindicated" when explicit contraindications found
    - Assign "not-recommended" for severe demographic gaps
    - Assign "caution" for moderate gaps
    - Assign "safe" otherwise
    - Ensure exactly one tier is assigned per analysis
    - _Requirements: 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 3.5 Generate agent outputs
    - Generate plain-language summary for clinicians
    - Generate questions for clinician consideration
    - Suggest alternative options when tier is unsafe (use LLM)
    - Ensure all required output fields are populated
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 10.5_
  
  - [ ]* 3.6 Write property tests for PatientSafetyAgent
    - **Property 5: Safety tier assignment invariant**
    - **Validates: Requirements 4.1, 4.6**
    - **Property 6: Contraindication detection**
    - **Validates: Requirements 3.3, 3.5, 4.5, 8.2, 8.3, 8.4**
    - **Property 7: Demographic gap detection**
    - **Validates: Requirements 3.4, 9.1, 9.2, 9.3**
    - **Property 8: Clinical alert generation**
    - **Validates: Requirements 3.6, 8.6**
    - **Property 9: Exclusion match identification**
    - **Validates: Requirements 3.7, 8.7**
    - **Property 24: SafetyTier output structure**
    - **Validates: Requirements 13.4, 13.5, 3.10, 3.11**
    - **Property 25: Demographic gap severity classification**
    - **Validates: Requirements 9.5, 9.6**
  
  - [ ]* 3.7 Write unit tests for specific safety scenarios
    - Test pediatric patient with adult-only treatment (contraindicated)
    - Test elderly patient with young adult studies (demographic gap)
    - Test patient matching study populations (safe)
    - Test multiple concurrent safety concerns
    - _Requirements: 23.1, 23.2, 23.3, 23.5_

- [ ] 4. Checkpoint - Ensure PatientSafetyAgent tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement veto coordinator in pipeline
  - [x] 5.1 Create veto determination logic
    - Implement `determineVeto(safetyOutput, qualityOutput, statsOutput)` function
    - Set hard veto when safetyTier is "contraindicated"
    - Set soft veto when safetyTier is "not-recommended"
    - Collect objections from quality agent (high bias risk)
    - Collect objections from statistics agent (weak evidence)
    - Return `VetoStatus` with type, reason, and objections
    - _Requirements: 5.1, 5.2, 5.5, 5.6, 5.7, 14.2, 14.3, 14.4_
  
  - [ ]* 5.2 Write property tests for veto logic
    - **Property 10: Hard veto for contraindicated tier**
    - **Validates: Requirements 5.1, 5.3, 5.8, 14.2, 14.6**
    - **Property 11: Soft veto for not-recommended tier**
    - **Validates: Requirements 5.2, 5.4, 14.3**
    - **Property 12: Research mode veto suppression**
    - **Validates: Requirements 20.2, 20.3**
    - **Property 13: Objection collection and passing**
    - **Validates: Requirements 5.5, 5.6, 5.7, 14.4, 14.5**

- [ ] 6. Update SynthesisAgent for defense and justification
  - [x] 6.1 Update SynthesisAgent signature and inputs
    - Add `vetoStatus: VetoStatus` parameter
    - Update to receive `PatientSafetyAgentOutput` instead of `PatientMatchAgentOutput`
    - _Requirements: 6.1, 14.5_
  
  - [x] 6.2 Implement veto response logic
    - Check veto status at start of synthesis
    - If hard veto, return "Do Not Proceed" with safety reasoning
    - If soft veto, proceed but require justification
    - Ensure hard vetoes cannot be overridden
    - _Requirements: 5.3, 5.4, 5.8, 14.6_
  
  - [x] 6.3 Implement evidence collection and objection response
    - Collect supporting evidence from all agents
    - Collect contradicting evidence and conflicts
    - Collect all objections (safety, quality, statistics)
    - Generate explicit response to each objection using LLM
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [x] 6.4 Implement comprehensive output generation
    - Generate clinician-facing summary (technical)
    - Generate patient-facing explanation (plain language)
    - Generate confidence justification mentioning all factors
    - Document bias concerns, data gaps, and uncertainty
    - List supporting and contradicting evidence
    - Include objection responses
    - _Requirements: 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [ ]* 6.5 Write property tests for SynthesisAgent
    - **Property 14: Synthesis output completeness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.7, 6.8, 6.9, 6.10**
    - **Property 15: Objection response completeness**
    - **Validates: Requirements 6.4**
    - **Property 16: Confidence justification completeness**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**
    - **Property 17: Bias and uncertainty surfacing**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6**

- [ ] 7. Update analysis pipeline orchestration
  - [x] 7.1 Integrate validation and veto logic into pipeline
    - Add mode and patient parameters to `runAnalyzePipeline` function
    - Call `validateRequest` at pipeline start
    - Return validation errors with HTTP 400 status
    - Execute PatientSafetyAgent (renamed from PatientMatchAgent)
    - Call `determineVeto` after parallel agent execution
    - Pass veto status to SynthesisAgent
    - Include veto status in response
    - _Requirements: 1.2, 2.6, 14.1, 14.5, 14.7_
  
  - [ ]* 7.2 Write property tests for pipeline execution
    - **Property 18: Safety-before-synthesis execution order**
    - **Validates: Requirements 14.1**
    - **Property 19: Veto status in response**
    - **Validates: Requirements 14.7**
  
  - [ ]* 7.3 Write integration tests for full pipeline
    - Test clinical mode with complete patient profile
    - Test clinical mode with incomplete profile (should fail)
    - Test research mode with missing patient data
    - Test hard veto blocking recommendation
    - Test soft veto requiring justification
    - _Requirements: 1.2, 1.3, 2.5, 20.1, 20.3, 20.5_

- [ ] 8. Checkpoint - Ensure backend integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Update API route for mode and patient profile
  - [x] 9.1 Update analyze route handler
    - Extract `mode` and `patient` from request body in `backend/routes/analyze.ts`
    - Pass mode and patient to `runAnalyzePipeline`
    - Handle validation errors and return HTTP 400 with error messages
    - Update response to include veto status
    - _Requirements: 1.1, 2.1, 21.4_
  
  - [ ]* 9.2 Write API endpoint tests
    - Test POST /analyze with clinical mode and complete profile
    - Test POST /analyze with clinical mode and incomplete profile (400 error)
    - Test POST /analyze with research mode and no profile
    - Test POST /analyze with invalid mode (400 error)
    - _Requirements: 1.4, 2.4, 21.1, 21.2, 21.3, 21.4_

- [ ] 10. Update frontend API client
  - [x] 10.1 Update API types and client in `src/lib/api.ts`
    - Add `AnalysisMode` type
    - Add `PatientProfile` type
    - Update `AnalyzeRequest` interface to include mode and patient
    - Update `AnalyzeResponse` interface to include patientSafety and vetoStatus
    - Update analyze function to send mode and patient
    - _Requirements: 13.6, 13.7, 13.8_

- [ ] 11. Implement frontend mode selection UI
  - [x] 11.1 Create mode selector component
    - Create `ModeSelector` component in `src/components/`
    - Provide radio buttons or toggle for "Clinical Mode" and "Research Mode"
    - Display mode descriptions
    - Emit mode change events
    - _Requirements: 1.5, 15.1, 15.2, 15.3_
  
  - [x] 11.2 Create patient profile form component
    - Create `PatientProfileForm` component in `src/components/`
    - Include fields for age, sex, primaryCondition
    - Include optional fields for comorbidities and medications
    - Mark required fields based on selected mode
    - Implement client-side validation
    - Display validation errors inline
    - Prevent submission if clinical mode and profile incomplete
    - _Requirements: 2.7, 15.4, 15.5, 21.5, 21.6_
  
  - [ ]* 11.3 Write property tests for frontend validation
    - **Property 22: Frontend validation in clinical mode**
    - **Validates: Requirements 2.7, 21.6**

- [ ] 12. Implement safety banner component
  - [x] 12.1 Create SafetyBanner component
    - Create `SafetyBanner` component in `src/components/`
    - Accept props: `safetyTier`, `summary`
    - Render color-coded banner based on tier
    - Red for "contraindicated", orange for "not-recommended", yellow for "caution", green for "safe"
    - Include appropriate icons (AlertTriangle, AlertCircle, Info, CheckCircle)
    - Display safety tier label and brief summary
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_

- [ ] 13. Implement clinical alerts display component
  - [x] 13.1 Create ClinicalAlerts component
    - Create `ClinicalAlerts` component in `src/components/`
    - Accept props: `alerts: ClinicalAlert[]`
    - Render list of alerts with warning icons
    - Display alert message, severity, and citations
    - Make section collapsible but expanded by default
    - Show "No specific clinical alerts identified" when empty
    - _Requirements: 7.7, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 14. Implement recommendation section with conditional rendering
  - [x] 14.1 Create RecommendationSection component
    - Create `RecommendationSection` component in `src/components/`
    - Accept props: `recommendation`, `safetyTier`, `objectionResponses`
    - Hide or gray out recommendation when tier is "contraindicated"
    - Display "Recommendation Withheld Due to Safety Concerns" for contraindicated
    - Show recommendation with warning border for "not-recommended"
    - Display recommendation normally for "caution" and "safe"
    - Show objection responses in expandable section
    - _Requirements: 7.6, 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ]* 14.2 Write property tests for recommendation rendering
    - **Property 20: Recommendation suppression for unsafe tiers**
    - **Validates: Requirements 7.6, 18.1, 18.2, 18.3**

- [ ] 15. Implement demographic gaps display component
  - [x] 15.1 Create DemographicGapsDisplay component
    - Create `DemographicGapsDisplay` component in `src/components/`
    - Accept props: `gaps: DemographicGap[]`
    - Visualize patient vs study population differences
    - Display plain language explanations
    - Show severity indicators (minor, moderate, severe)
    - Explain impact of each gap
    - _Requirements: 7.8, 9.5, 9.6_

- [ ] 16. Implement patient explanation component
  - [x] 16.1 Create PatientExplanation component
    - Create `PatientExplanation` component in `src/components/`
    - Accept props: `explanation: string`
    - Display plain language content
    - Include "Copy for Patient" button
    - Clearly label as patient-facing content
    - _Requirements: 7.9, 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 17. Implement alternative options display
  - [x] 17.1 Create AlternativeOptions component
    - Create `AlternativeOptions` component in `src/components/`
    - Accept props: `alternatives: string[]`, `rationales: string[]`
    - Display alternatives when provided
    - Show rationale for each alternative
    - _Requirements: 7.10, 10.5_
  
  - [ ]* 17.2 Write property tests for alternative display
    - **Property 21: Alternative options display**
    - **Validates: Requirements 7.10**

- [ ] 18. Update Results page to integrate safety components
  - [x] 18.1 Refactor Results.tsx to use new components
    - Import all new safety components
    - Render SafetyBanner at top of page
    - Render ClinicalAlerts below banner
    - Render DemographicGapsDisplay
    - Render RecommendationSection with conditional logic
    - Render PatientExplanation
    - Render AlternativeOptions when available
    - Display selected mode in results view
    - Update to use patientSafety instead of patientMatch
    - _Requirements: 7.1, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 15.7_

- [ ] 19. Update query/search page to include mode selector and patient form
  - [x] 19.1 Integrate mode selector and patient form
    - Add ModeSelector to query page
    - Add PatientProfileForm to query page
    - Show/hide required field indicators based on mode
    - Pass mode and patient data to API call
    - Handle validation errors from backend
    - _Requirements: 1.5, 2.7, 15.1, 15.4, 15.5, 15.6_

- [ ] 20. Checkpoint - Ensure frontend components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Add logging for audit and compliance
  - [ ] 21.1 Implement logging in PatientSafetyAgent
    - Log safety tier assignments with reasoning
    - Log all contraindications detected
    - Log all demographic gaps identified
    - Include timestamps and request identifiers
    - _Requirements: 22.1, 22.2, 22.3_
  
  - [ ] 21.2 Implement logging in pipeline
    - Log veto triggers with reasoning
    - Log all objections passed to synthesis
    - Log final recommendations and confidence scores
    - Include timestamps and request identifiers
    - _Requirements: 22.2, 22.3, 22.4, 22.5_

- [ ] 22. Add error handling for edge cases
  - [ ] 22.1 Handle LLM failures gracefully
    - If PatientSafetyAgent LLM fails, return default safe tier with warning
    - If SynthesisAgent LLM fails during hard veto, return "Do Not Proceed"
    - If SynthesisAgent LLM fails during normal synthesis, return error
    - Log all LLM failures
    - _Requirements: Error Handling section_
  
  - [ ] 22.2 Handle missing or malformed paper data
    - Handle papers with missing abstracts
    - Handle papers with incomplete metadata
    - Log data quality issues
    - _Requirements: 23.6_
  
  - [ ] 22.3 Implement timeout handling
    - Set 30-second timeout for complete pipeline
    - Return partial results with warning on timeout
    - Prioritize safety analysis completion
    - _Requirements: Error Handling section_

- [ ] 23. Write comprehensive test suite
  - [ ]* 23.1 Set up property-based testing with fast-check
    - Install fast-check library
    - Create test data generators for PatientProfile, SafetyTier, AnalysisMode
    - Configure minimum 100 iterations per property test
    - Set up test tagging format
    - _Requirements: Testing Strategy section_
  
  - [ ]* 23.2 Implement all property tests
    - Implement Properties 1-25 as defined in design document
    - Tag each test with feature name and property number
    - Ensure each property test runs 100+ iterations
    - _Requirements: All property validation requirements_
  
  - [ ]* 23.3 Write unit tests for specific scenarios
    - Test contraindicated patient scenario
    - Test demographic mismatch scenario
    - Test good match scenario
    - Test research mode with missing data
    - Test multiple concurrent safety concerns
    - Test edge cases (empty papers, missing abstracts)
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

- [ ] 24. Final checkpoint - Run full test suite
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Update documentation
  - [ ] 25.1 Create user documentation
    - Document clinical vs research mode differences
    - Provide examples of complete patient profiles
    - Explain each SafetyTier and its meaning
    - Describe veto logic and when recommendations are blocked
    - Include best practices for interpreting safety alerts
    - Clarify system is decision support, not replacement for judgment
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6_
  
  - [ ] 25.2 Update API documentation
    - Document new request parameters (mode, patient)
    - Document new response fields (patientSafety, vetoStatus)
    - Provide example requests and responses
    - Document error codes and messages
    - _Requirements: 20.5_
  
  - [ ] 25.3 Update developer documentation
    - Document new type definitions
    - Document agent interfaces and responsibilities
    - Document veto logic flow
    - Document testing strategy and property tests
    - _Requirements: Testing Strategy section_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and integration points
- The implementation preserves existing architecture where possible
- Research mode maintains backwards compatibility with existing usage
- Clinical mode enforces strict safety requirements with veto capability
