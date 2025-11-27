# Design Refresh Plan: Modern Education Theme

## Objective
Execute a complete visual redesign to align with a modern, fresh "Education" theme (Clean, Trustworthy, Accessible, Structured) and resolve layout issues.

## Phase 1: Audit & Blueprint

### Identified Issues
1.  **Color Palette:** Current palette is slightly too vibrant/playful. Needs to be softer and more "trustworthy" (Blues/Teals, soft Greys).
2.  **Z-Index Management:** Potential clashes between Navbar (`z-50`), BottomNavigation (`z-50`), and Modals.
3.  **Spacing & Layout:**
    *   `pb-safe` used in BottomNavigation is undefined.
    *   Potential overlap of fixed elements with content on mobile.
    *   Card spacing needs to be consistent.
4.  **Typography:** Ensure clear hierarchy between Headings (Poppins) and Body (Inter).

### Proposed Changes

#### 1. Global Styles (`src/styles/globals.css`)
*   **Palette Update:** Shift `brand` colors to a more calming Blue/Teal spectrum. Soften `neutral` grays.
*   **Typography:** Enforce `font-display` for headings and `font-sans` for body globally.
*   **Utilities:** Add `pb-safe` for safe area padding (iPhone X+).
*   **Z-Index System:** Establish a strict Z-Index scale:
    *   Content: 0-10
    *   Sticky/Fixed Elements (Navbar, BottomNav): 40-50
    *   Overlays/Modals: 60-100
    *   Tooltips/Toasts: 100+

#### 2. Component Refactoring
*   **Navbar (`src/components/navbar/index.js`):**
    *   Update styling to match new "glass" effect.
    *   Ensure correct z-index.
*   **Bottom Navigation (`src/components/bottom-navigation/index.js`):**
    *   Fix `pb-safe` usage.
    *   Ensure it doesn't block content (check `main` padding).
*   **Question Editor (`src/modules/question-editor/index.js`):**
    *   Refine card styling (shadows, borders).
    *   Improve form layout (grid gaps, label spacing).
*   **Main Layout (`src/pages/index.js`):**
    *   Verify `pt-20` and `pb-28` are sufficient for fixed headers/footers.

## Phase 2: Execution (Immediate)

1.  **Update `tailwind.config.js`:** Define the new "Education" color palette.
2.  **Update `src/styles/globals.css`:** Implement the new styles and utility classes.
3.  **Refactor Components:** Apply changes to Navbar, BottomNavigation, and QuestionEditor.
