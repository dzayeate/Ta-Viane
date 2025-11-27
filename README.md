# Auto Physics

Auto Physics is an AI-powered platform designed to help teachers generate physics problems, experiments, and worksheets quickly and easily.

## Features

- **AI Question Generation**: Generate physics questions based on Bloom's Taxonomy levels (C1-C6).
- **Modular Architecture**: Built with a clean, modular structure for scalability.
- **Multi-language Support**: Supports Indonesian and English (via i18n).
- **PDF Parsing**: Upload PDF materials to generate questions from.
- **Question Bank**: Save and manage generated questions.

## Tech Stack

- **Framework**: Next.js (Pages Router)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini
- **State Management**: React Hooks
- **Internationalization**: next-i18next

## Project Structure

```
.
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared UI components
│   ├── modules/            # Feature modules (Auth, Question Editor, etc.)
│   ├── libs/               # Library configurations (Gemini, etc.)
│   ├── locales/            # i18n translation files
│   ├── styles/             # Global styles
│   ├── pages/              # Next.js Pages
│   └── utils/              # Utility functions
└── ...
```

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Set up environment variables:
    Copy `.env.example` to `.env` and add your `NEXT_PUBLIC_GEMINI_API_KEY`.

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:8000](http://localhost:8000) in your browser.
