---
phase: 3
plan: 3
wave: 2
---

# Plan 3.3: Citation Extractor & Source Classifier

## Objective

Create the citation extraction and source classification module. Extract URLs from responses and classify them as owned, earned, or external.

## Context

- .gsd/SPEC.md
- .gsd/phases/3/RESEARCH.md
- dashboard/src/lib/analysis/
- dashboard/src/types/analysis.ts

## Tasks

<task type="auto">
  <name>Create Citation Extractor</name>
  <files>
    - dashboard/src/lib/analysis/citations.ts
  </files>
  <action>
    Create citation extraction module:
    
    ```typescript
    export interface ExtractedCitation {
      url: string;
      domain: string;
      raw_text: string;
    }
    
    export function extractUrls(text: string): ExtractedCitation[]
    export function extractDomain(url: string): string
    ```
    
    Implementation:
    1. Use regex to find URLs (http/https)
    2. Extract domain from each URL
    3. Also look for domain-only mentions (e.g., "salesforce.com")
    4. Deduplicate by domain
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/analysis/citations.ts</verify>
  <done>Citation extractor compiles and handles various URL formats</done>
</task>

<task type="auto">
  <name>Create Source Classifier</name>
  <files>
    - dashboard/src/lib/analysis/classifier.ts
  </files>
  <action>
    Create source classification logic:
    
    ```typescript
    export type SourceType = 'owned' | 'earned' | 'external';
    
    export interface ClassificationContext {
      brandDomain?: string;      // e.g., "notion.so"
      competitorDomains?: string[];
    }
    
    export function classifySource(
      domain: string,
      context: ClassificationContext
    ): SourceType
    ```
    
    Classification rules:
    - **owned**: Domain matches brand's domain
    - **earned**: Domain is a known review/media site (G2, Capterra, TechCrunch, etc.)
    - **external**: Everything else (competitors, random sites)
    
    Include list of known review/media domains.
  </action>
  <verify>npx tsc --noEmit dashboard/src/lib/analysis/classifier.ts</verify>
  <done>Classifier correctly categorizes owned/earned/external</done>
</task>

## Success Criteria

- [ ] URL extraction handles various formats (with/without protocol)
- [ ] Domain extraction works correctly
- [ ] Source classification distinguishes owned/earned/external
