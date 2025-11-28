# Question Creation Process: Technical Report

## 1. Overview
The Question Creation module has been unified into a single entry point (`/create-question`) to streamline the user experience. This page utilizes a **Tab System** to toggle between two distinct workflows:
1.  **Automatic (AI-Powered):** Generates questions based on prompts and configuration.
2.  **Manual:** Sets up a blank template with specific metadata for manual entry.

**Key Architectural Pattern:**
The creation page acts as a **Configuration Wizard**. It does not create the questions directly. Instead, it captures the user's intent and configuration, saves it to `sessionStorage`, and redirects the user to the main **Dashboard (`/`)**, where the actual processing (AI generation or Template instantiation) occurs.

---

## 2. Mode A: Automatic Question Creation (AI-Powered)

### 2.1 User Input (Frontend)
Located in `src/pages/create-question/index.js` (Tab: "Otomatis").
The user provides the following data:
*   **Prompt:** Text description of the desired question (e.g., "Hukum Newton").
*   **Topic & Grade:** Mandatory metadata (e.g., "Dinamika Partikel", "Kelas X").
*   **Difficulty:** Bloom's Taxonomy level (C1-C6) or "Random".
*   **Type:** "Essay", "Multiple Choice", or "Random".
*   **Total:** Number of questions to generate (1-100).
*   **Reference:** Optional text or PDF upload (parsed via `/api/pdf-parse`) to provide context.

### 2.2 Process Flow
1.  **Configuration:** User submits the form. Data is saved to `sessionStorage` key: `auto_generate_config`.
2.  **Redirection:** User is redirected to `/`.
3.  **Initialization:** `src/pages/index.js` detects the config in `useEffect`.
4.  **Streaming Request:** The `onGenerateStreaming` function is triggered.
    *   It creates "Skeleton" placeholders in the UI state.
    *   It initiates a `fetch` request to `/api/generate` with `stream: true`.

### 2.3 AI Service & Data Handling
*   **API Endpoint:** `src/pages/api/generate.js`
*   **Prompt Engineering:** `src/libs/Gemini.js` constructs a structured prompt using System Prompts (`src/utils/system-prompt/`) and Few-Shot Examples (`src/utils/fine-tune/`).
    *   **Format:** `|-[Prompt]-| |-[Reference]-| |-[Difficulty]-| |-[Type]-| |-[Range]-|`
*   **Streaming Response:** The API uses **Server-Sent Events (SSE)** logic.
    *   It yields chunks of data: `data: {"type": "question", "data": {...}}`.
*   **Client-Side Parsing:**
    *   The dashboard reads the stream using `response.body.getReader()`.
    *   Incoming JSON chunks are parsed and immediately replace the "Skeleton" loaders in the `questions` state.

---

## 3. Mode B: Manual Question Creation

### 3.1 User Input (Frontend)
Located in `src/pages/create-question/index.js` (Tab: "Manual").
The user provides **Metadata Only**:
*   **Topic:** (e.g., "Aljabar").
*   **Grade:** (e.g., "Kelas XI").
*   **Difficulty:** Default difficulty for the blank template.
*   **Type:** Default type (Essay/Multiple Choice).

### 3.2 Process Flow
1.  **Configuration:** User submits the form. Data is saved to `sessionStorage` key: `manual_create_config`.
2.  **Redirection:** User is redirected to `/`.
3.  **Instantiation:** `src/pages/index.js` detects the config in `useEffect`.
4.  **Template Creation:**
    *   The system **does not** call the AI API.
    *   It appends a **Blank Question Object** to the `questions` state.
    *   The object is pre-filled with the user's selected Topic, Grade, and Difficulty.

### 3.3 Editing & Submission
*   **Editor:** The user fills in the "Question Text", "Answer", and "Description" using the `QuestionEditor` component.
*   **Validation:** Basic client-side checks (required fields) are performed during the "Review" phase.
*   **Saving:** When the user clicks "Save" (Simpan ke Bank Soal), the data is sent to `/api/questions` (POST) to be persisted in the database/file system.

---

## 4. Technical Implementation Details

### Key Components & Files
| Component/File | Role |
| :--- | :--- |
| `src/pages/create-question/index.js` | **Unified Entry Point.** Handles form validation and `sessionStorage` logic. |
| `src/pages/index.js` | **Controller.** Consumes config, manages `questions` state, handles Streaming and Manual instantiation. |
| `src/pages/api/generate.js` | **AI Controller.** Handles SSE streaming and batching logic. |
| `src/libs/Gemini.js` | **AI Service.** Manages API keys, model configuration, and prompt construction. |
| `src/modules/question-editor/` | **UI Component.** The card interface for editing question content. |

### Data Structures

**1. Configuration Object (SessionStorage)**
```json
{
  "prompt": "...",
  "topic": "Physics",
  "grade": "X",
  "difficulty": "c3",
  "type": "essay",
  "total": 5,
  "reference": "..."
}
```

**2. Question Object (State)**
```javascript
{
  prompt: "Original Prompt",
  difficulty: "c3",
  type: "essay",
  title: "Question Text...",      // Filled by AI or User
  description: "Explanation...",  // Filled by AI or User
  answer: "Correct Answer...",    // Filled by AI or User
  topic: "Physics",
  grade: "X",
  isLoading: false
}
```

### Database Interaction
*   **Endpoint:** `/api/questions`
*   **Method:** `POST`
*   **Payload:** Array of `Question Object` + Metadata (Author, Timestamp).
*   **Storage:** Currently implemented as a File System mock (`src/mock/questions/index.json`) or MongoDB (depending on environment configuration).
