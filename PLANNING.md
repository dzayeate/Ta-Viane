# MASTER PLAN: Codebase Optimization & Bug Fixes

## Phase 1 & 2 (COMPLETED)
- [x] Foundation & Rules (Hybrid V3).
- [x] Critical Bug Fixes (Legacy Data, Auto Input, Review Blank).

## Phase 3: Structural Refactoring (Almost Done)
- [x] **Refactor `src/pages/index.js`:**
    -   Extracted logic to `useHomeLogic`.
- [x] **Refactor Streaming Logic:**
    -   Centralized in `streamingService`.
- [ ] **Component Standardization (Step 6):**
    -   [ ] Enforce usage of `.btn`, `.card`, `.input` classes from `globals.css` across all components to ensure visual consistency.
- [ ] **Final Code Cleanup (Step 7):**
    -   [ ] Remove unused imports (dead code) resulting from the extraction process.
    -   [ ] Verify strict types (if using TS) or prop types.