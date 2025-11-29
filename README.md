# Auto Physics - AI-Powered Physics LMS

<p align="center">
  <img src="public/logo.png" alt="Auto Physics Logo" width="120" />
</p>

<p align="center">
  <strong>An intelligent Learning Management System for Physics education</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#folder-structure">Structure</a>
</p>

---

## 📖 Overview

**Auto Physics** is a modern Learning Management System (LMS) designed specifically for Physics education. It leverages AI to automatically generate questions based on Bloom's Taxonomy, manage virtual classrooms, and conduct Computer-Based Tests (CBT) with built-in identity verification.

### What It Does

- 🤖 **AI Question Generation** — Generate physics questions instantly using Google Gemini AI
- 🏫 **Classroom Management** — Create and manage classes for teachers and students
- 📝 **Exam Management** — Create, distribute, and grade CBT exams seamlessly
- 📊 **Analytics** — Track student performance and exam results

---

## ✨ Features

### 🧠 AI Question Generation (Bloom's Taxonomy)

Generate physics questions across all cognitive levels:

| Level | Description |
|-------|-------------|
| C1 - Remember | Basic recall of facts and concepts |
| C2 - Understand | Explain ideas or concepts |
| C3 - Apply | Use information in new situations |
| C4 - Analyze | Draw connections among ideas |
| C5 - Evaluate | Justify a decision or course of action |
| C6 - Create | Produce new or original work |

Supports **Multiple Choice (MCQ)** and **Essay** question types with customizable topics and difficulty levels.

### 🏫 Classroom Management

**For Teachers:**
- Create classes with unique join codes
- Manage student enrollment (approve/reject)
- View class rosters with NISN verification
- Assign exams to specific classes

**For Students:**
- Join classes using invite codes
- View assigned exams and deadlines
- Track personal progress and grades

### 📝 CBT with Identity Guard

- **Secure Exam Environment** — Students must verify identity before starting
- **Time-Limited Tests** — Configurable exam duration
- **Auto-Submit** — Automatic submission when time expires
- **Question Navigation** — Easy navigation between questions with status indicators

### ✅ Auto-Grading & Manual Grading

| Question Type | Grading Method |
|---------------|----------------|
| Multiple Choice (MCQ) | ✅ Automatic |
| Essay | 📝 Manual by Teacher |

Teachers can review and grade essay responses through an intuitive grading interface.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with file-based routing |
| **Tailwind CSS** | Utility-first CSS styling |
| **Google Gemini AI** | AI-powered question generation |
| **SweetAlert2** | Beautiful alert dialogs |
| **next-i18next** | Internationalization (ID/EN) |

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API Key

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/auto-physics.git
   cd auto-physics
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > 💡 Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Folder Structure

```
src/
├── components/       # Shared UI components (Button, Modal, Navbar, etc.)
├── modules/          # Feature modules (domain-specific logic)
│   ├── auth/         # Authentication logic
│   ├── classroom/    # Classroom management
│   ├── home/         # Homepage & question generation
│   └── question-editor/  # Question editing tools
├── pages/            # Next.js routes
│   ├── api/          # API endpoints
│   ├── classes/      # Classroom pages
│   ├── exams/        # Exam management (teacher)
│   ├── exam/         # Exam taking (student)
│   └── saved-questions/  # Question bank
├── libs/             # Third-party configurations (Gemini)
├── mock/             # Mock data (users, questions)
├── styles/           # Global CSS (Tailwind)
├── utils/            # Shared utilities
│   ├── system-prompt/    # AI prompt templates
│   └── fine-tune/        # Few-shot examples
└── validations/      # Zod schemas
```

### Key Directories

| Directory | Description |
|-----------|-------------|
| `src/modules/` | Feature-based modules with components, hooks, and utils |
| `src/pages/` | Next.js file-based routing (keep logic minimal) |
| `src/mock/` | JSON mock data for development and testing |
| `src/utils/system-prompt/` | AI system prompts for question generation |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for AI features |

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for Physics Education
</p>
