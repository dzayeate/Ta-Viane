# GitHub Copilot Instructions

## Project Overview
This is a **Next.js** application currently transitioning to a professional architecture based on the **[ixartz/Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate)**.
The goal is to migrate from the legacy structure to a clean, organized `src/` directory structure with strict separation of concerns and **Modular Architecture**.

## Target Architecture (ixartz Pattern + Modular)
All new code and refactoring must follow this structure:

```
.
├── public/                 # Static assets (images, fonts, locales)
├── src/
│   ├── components/         # SHARED Reusable UI components (Atoms/Molecules)
│   ├── modules/            # FEATURE MODULES (Domain-specific logic & UI)
│   │   ├── auth/           # Example Module
│   │   │   ├── components/ # Module-specific components
│   │   │   ├── hooks/      # Module-specific hooks
│   │   │   └── utils/      # Module-specific utilities
│   │   └── question/       # Question Generation Module
│   ├── libs/               # 3rd party library configurations (Env, DB, etc.)
│   ├── locales/            # i18n translation files (if moving from public)
│   ├── styles/             # Global styles (Tailwind CSS)
│   ├── templates/          # Page layouts/templates (BaseTemplate, etc.)
│   ├── utils/              # SHARED Utility functions & AppConfig
│   ├── validations/        # SHARED Zod schemas
│   └── pages/              # Next.js Pages (or 'app/' if migrating to App Router)
├── tests/                  # E2E and Integration tests
└── next.config.js          # Next.js configuration
```

## Modular Architecture Strategy
- **Modules (`src/modules/`)**: Encapsulate features. If a component or logic is ONLY used within a specific feature (e.g., "Question Editor"), it belongs in `src/modules/question-editor/`.
- **Shared (`src/components/`, `src/utils/`)**: Only code used across multiple modules goes here.
- **Dependency Rule**: Modules should not import from other modules directly if possible. Use shared `libs` or `utils` for communication, or lift shared state.

## Critical Developer Workflows
- **Refactoring Strategy**:
  - Move code to `src/` incrementally.
  - Identify "Features" (e.g., Login, QuestionEditor) and move them to `src/modules/`.
  - Separate "Page Logic" (Next.js specific) from "Template Logic" (UI layout).
  - Centralize configuration in `src/utils/AppConfig.ts`.
- **AI Generation Logic**:
  - Core logic resides in `src/modules/question-generator/utils/` or `src/libs/`.
  - API routes (`pages/api/`) should import logic from `src/libs/` or `src/services/` rather than containing business logic directly.
- **Streaming**:
  - The API uses `res.write()` and `res.flush()` for SSE. Ensure any new API endpoints supporting streaming follow this pattern.

## Prompt Engineering Workflow
- **System Prompts**: Located in `src/utils/system-prompt/` (formerly `utils/system-prompt/`).
  - `systemPromptDetailId/En`: For generating single detailed questions.
  - `systemPromptListId/En`: For generating lists of question ideas.
  - **Format**: Strictly enforces CSV output with `|->` delimiters.
  - **Persona**: "Indonesian SMA Physics Teacher" - authoritative, clear, educational.
- **Fine-Tuning (Few-Shot)**: Located in `src/utils/fine-tune/` (formerly `utils/fine-tune/`).
  - Contains arrays of example user/assistant turns (`fineTuneDetailId`, `fineTuneListId`, etc.).
  - **Pattern**: `|-[prompt]-| |-[cognitive level]-| |-[type]-|` -> `Title|->Description|->Answer|->Topic`.
  - **LaTeX & SVG**: Examples are provided in `latexExample` and `svgExample` variables.
- **Modification Rule**: To change AI behavior, modify the *examples* in `fine-tune` or the *instructions* in `system-prompt`. Do not hardcode prompts in components.

## Styling & UI Patterns
- **Global CSS**: `src/styles/globals.css` is the source of truth for component styles.
- **Button System**: Use `.btn` combined with variants:
  - `.btn-primary` (Brand color), `.btn-secondary` (Neutral), `.btn-accent`, `.btn-success`, `.btn-danger`.
  - Sizes: `.btn-sm`, `.btn-lg`.
  - Ghost/Outline: `.btn-ghost`, `.btn-outline`.
- **Card System**:
  - `.card`: Base style with shadow and border.
  - `.card-hover`: Adds hover lift and shadow.
  - `.card-interactive`: For clickable cards.
- **Glassmorphism**:
  - `.glass`: Standard glass effect.
  - `.glass-strong`: Heavier blur/opacity (used in Navbar).
- **Inputs**: `.input`, `.input-error`, `.input-success`.
- **Badges**: `.badge`, `.badge-primary`, `.badge-neutral`, etc.
- **Gradients**: `.bg-gradient-brand`, `.text-gradient`.

## Code Style & Conventions
- **Naming**:
  - Components: `PascalCase` (e.g., `QuestionEditor.tsx`).
  - Utilities: `camelCase` or `PascalCase` (e.g., `AppConfig.ts`).
  - Directories: `kebab-case` (e.g., `question-editor`).
- **Component Colocation**:
  - Store tests (`.test.tsx`) and stories (`.stories.tsx`) next to the component.
- **Imports**:
  - Use absolute imports `@/` pointing to `src/`.
- **State Management**:
  - Prefer local state or parent-controlled state (lifting state up) for forms.
  - Example: `QuestionEditor` receives `question` and `onInputChange` from its parent.
- **Icons**: Use `react-icons` (specifically `react-icons/hi2`, `react-icons/io5`).

## Key Files (Current vs Target)
- `pages/api/generate.js` -> Should eventually move logic to `src/libs/Gemini.ts`.
- `styles/globals.css` -> Move to `src/styles/global.css`.
- `components/features/` -> Move to `src/modules/`.

## Common Pitfalls
- **Azure vs Gemini**: Ignore `@azure/openai` in `package.json`; the project uses Google Gemini.
- **Hydration**: Use the `mounted` state pattern in `_app.js` or components to avoid hydration mismatches, especially with UI libraries.
- **Path Aliases**: Ensure `tsconfig.json` or `jsconfig.json` is updated to support `@/` mapping to `src/`.
- **Migration State**: The project is in a hybrid state. Check if a file exists in `src/` before creating it in the root.
