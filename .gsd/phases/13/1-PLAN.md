---
phase: 13
plan: 1
wave: 1
---

# Plan 13.1: Codebase Cleanup & Structural Prep

## Objective
Remove redundant entry points and temporary files to clean the project root and dashboard directory. Prepare the structure for professional standards.

## Context
- .gsd/SPEC.md
- Implementation Plan

## Tasks

<task type="auto">
  <name>Redundant File Deletion</name>
  <files>
    check_brand_domain.js,
    check_brand_simple.js,
    check_prompts.ts,
    debug_collection_empty.js,
    query_prompts.js,
    dashboard/build-output.txt,
    dashboard/build_output.txt,
    dashboard/check_brand.ts,
    dashboard/check_results.txt,
    dashboard/debug_empty_results.ts,
    dashboard/process_error.txt,
    dashboard/seed_output.txt
  </files>
  <action>
    Remove all identified redundant scripts and text files from the project root and dashboard directory.
  </action>
  <verify>ls -R | findstr /C:"check_brand_domain" /C:"build_output"</verify>
  <done>Files are removed and root is clean.</done>
</task>

<task type="auto">
  <name>Structural Reorganization</name>
  <files>.gitignore, scripts/</files>
  <action>
    1. Update the root .gitignore to include standard Next.js and Node.js patterns.
    2. Create a root `scripts/` directory if needed for future utilities.
    3. Ensure `clover/` venv is ignored correctly.
  </action>
  <verify>cat .gitignore</verify>
  <done>.gitignore is comprehensive and scripts directory exists.</done>
</task>

## Success Criteria
- [ ] Project root contains only essential configuration and main directories.
- [ ] Dashboard directory is free of build logs and debug scripts.
- [ ] .gitignore prevents future noise.
