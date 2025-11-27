# Navigation Migration Plan: Side Menu Architecture

## Objective
Replace the existing Top Navbar and Bottom Navigation with a modern, responsive **Side Menu (Sidebar)** architecture.

## Phase 1: Plan & Deprecate

### Components to Deprecate (Desktop)
1.  **Top Navbar (`src/components/navbar`)**: Will be removed on Desktop. On Mobile, it might serve as a header for the hamburger toggle.
2.  **Bottom Navigation (`src/components/bottom-navigation`)**: Will be hidden on Desktop.

### New Component: `Sidebar`
*   **Location**: `src/components/sidebar/index.js`
*   **Structure**:
    *   **Header**: Logo + App Name.
    *   **Primary Actions**: "Buat Soal" (Generate), "Tambah Manual".
    *   **Navigation**: Home, Bank Soal (Saved Questions).
    *   **Footer**: User Profile (Name/NUPTK), Language Switcher, Logout.
*   **Responsiveness**:
    *   **Desktop (`lg`+)**: Fixed, expanded sidebar.
    *   **Tablet (`md`)**: Collapsed icon-only sidebar (optional) or full sidebar.
    *   **Mobile**: Hidden, accessible via Hamburger menu (Drawer).

## Phase 2: Implementation Steps

1.  **Create `Sidebar` Component**:
    *   Implement using Tailwind classes for fixed positioning and styling.
    *   Include all functionality currently in BottomNav (Generate, Add, Review, Feedback).
2.  **Refactor `src/pages/index.js`**:
    *   Change layout container to `flex`.
    *   Insert `Sidebar` as the first child.
    *   Wrap existing content in a `<main>` tag with proper margins (`ml-64` for desktop).
    *   Conditionally render `Navbar`/`BottomNav` only for mobile (or remove entirely if Sidebar Drawer is sufficient). *Decision: Use Sidebar Drawer for mobile to strictly "Replace" as requested, but keeping BottomNav for mobile is often better UX. I will implement a responsive Sidebar that works for both, but for this task, I will focus on the Sidebar structure.*

## Phase 3: Integration
*   Ensure `z-index` of Sidebar is higher than content.
*   Adjust padding of the main content area to avoid overlap.

## Phase 4: Polish & Fixes
- [x] Fix "main.home" label in Sidebar (Added translation keys).
- [x] Fix 'main.home' label in Sidebar (Added translation keys to en/id locales).
