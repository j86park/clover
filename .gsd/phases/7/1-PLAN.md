---
phase: 7
plan: 1
wave: 1
---

# Plan 7.1: Testing Infrastructure & LLM-as-a-Judge

## Objective
Set up the testing framework infrastructure and implement the LLM-as-a-Judge scoring system for semantic relevance evaluation. This provides the foundation for all validation features in Phase 7.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- dashboard/src/lib/openrouter/client.ts — existing LLM client
- dashboard/src/lib/analysis/prompts.ts — prompt patterns
- dashboard/src/types/analysis.ts — type definitions

## Tasks

<task type="auto">
  <name>Create testing types and interfaces</name>
  <files>
    dashboard/src/types/testing.ts (NEW)
    dashboard/src/types/index.ts
  </files>
  <action>
    Create comprehensive TypeScript types for the testing framework:
    - TestCase interface (id, name, description, input, expectedOutput)
    - TestResult interface (testId, passed, score, details, timestamp)
    - JudgeScore interface (relevance, accuracy, completeness, reasoning)
    - ABTestConfig interface (variants, sampleSize, duration)
    - CorrelationData interface (brandMentions, searchVolume, correlation)
    - ValidationReport interface (testResults, summary, recommendations)
    
    Export all types from types/index.ts
  </action>
  <verify>tsc --noEmit (no type errors)</verify>
  <done>All testing types defined and exported without TypeScript errors</done>
</task>

<task type="auto">
  <name>Implement LLM-as-a-Judge scoring module</name>
  <files>
    dashboard/src/lib/testing/judge.ts (NEW)
    dashboard/src/lib/testing/prompts.ts (NEW)
    dashboard/src/lib/testing/index.ts (NEW)
  </files>
  <action>
    Create the LLM-as-a-Judge system:
    
    1. prompts.ts — Define judge prompts:
       - JUDGE_SYSTEM_PROMPT: Role definition for relevance evaluation
       - createJudgePrompt(response, groundTruth, criteria): Evaluation request
    
    2. judge.ts — Core judging logic:
       - scoreSemanticRelevance(response, groundTruth): Returns 0-100 score
       - scoreAccuracy(response, facts): Fact-checking score
       - scoreCompleteness(response, expectedElements): Coverage score
       - evaluateResponse(response, criteria): Full JudgeScore object
       - Use existing queryLLM from openrouter/client.ts
       - Parse JSON responses with validation
    
    3. index.ts — Re-export all public APIs
    
    Follow patterns from lib/analysis/analyzer.ts for LLM integration
  </action>
  <verify>tsc --noEmit && manual test via API endpoint</verify>
  <done>LLM-as-a-Judge module compiles and can evaluate responses</done>
</task>

## Success Criteria
- [ ] Testing types defined in types/testing.ts
- [ ] LLM-as-a-Judge module in lib/testing/
- [ ] No TypeScript compilation errors
- [ ] Module follows existing codebase patterns
