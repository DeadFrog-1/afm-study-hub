# AFM Study Hub — Complete Build Prompt
# Paste this entire prompt into any LLM to generate the full working codebase.
# Then follow the setup instructions at the bottom.

---

You are a senior full-stack developer. Generate the COMPLETE working codebase for "AFM Study Hub" — a personal ACCA AFM exam study app. This is a single-user, offline-first Next.js app.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, better-sqlite3, Zustand, Lucide React
**Exam Date:** 2026-06-05
**Chapter 1 is pre-loaded with 25 pages of content.**

Generate EVERY file listed below with FULL implementation — no placeholders, no TODOs.

---

## FILE STRUCTURE TO CREATE

```
afm-study-hub/
├── .env.example
├── .gitignore
├── package.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    (redirect to /dashboard)
│   │   ├── dashboard/page.tsx
│   │   ├── chapter/[id]/page.tsx       (content tab with arrow navigation)
│   │   ├── chapter/[id]/questions/page.tsx
│   │   ├── chapter/[id]/quiz/page.tsx
│   │   ├── chapter/[id]/flashcards/page.tsx
│   │   ├── chapter/[id]/mindmap/page.tsx
│   │   ├── chapter/[id]/cr-exam/page.tsx
│   │   ├── daily-challenge/page.tsx
│   │   ├── quiz-battle/page.tsx
│   │   ├── exam-simulation/page.tsx
│   │   ├── study-analytics/page.tsx
│   │   └── api/
│   │       ├── content/[chapter]/route.ts   (serves chapter JSON + metadata)
│   │       ├── progress/route.ts            (SQLite read/write)
│   │       └── summary/route.ts             (placeholder)
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── layout/TopBar.tsx
│   │   ├── layout/ExamCountdown.tsx
│   │   ├── chapter/ChapterContent.tsx
│   │   ├── chapter/PageSummary.tsx
│   │   ├── chapter/ConfidenceMarker.tsx
│   │   ├── chapter/VideoPlayer.tsx
│   │   ├── questions/QuestionCard.tsx
│   │   ├── quiz/QuizCard.tsx
│   │   ├── flashcards/FlashcardDeck.tsx
│   │   └── mindmap/MindMap.tsx
│   ├── lib/
│   │   ├── db.ts                 (SQLite with all tables)
│   │   └── content-loader.ts     (reads chapter JSON from disk)
│   ├── store/useStudyStore.ts    (Zustand global state)
│   ├── types/index.ts            (all TypeScript interfaces)
│   └── styles/globals.css        (CSS variables, themes, animations)
├── content/
│   ├── metadata.json             (chapter index)
│   └── chapters/ch01/chapter.json (25 pre-loaded pages)
└── electron/main.js              (optional desktop wrapper)
```

---

## DESIGN SYSTEM

### Colors (CSS variables in globals.css)
```
Light mode:
  --bg-primary: #F5F0F8 (creamy violet)
  --bg-secondary: #EDE8F5
  --bg-card: #FFFFFF
  --heading-color: #6B0000 (dark maroon — ALL headings)
  --text-primary: #2D1B4E
  --text-secondary: #5A4478
  --accent: #800000
  --border: #D8CEF0
  --highlight-bg: #FFF8E7
  --formula-bg: #EFF6FF
  --important-bg: #FFF0F0
  --summary-bg: #F9F7FF
  --summary-border: #A78BFA
  --success: #10B981
  --warning: #F59E0B
  --error: #EF4444

Dark mode: [data-theme="dark"]
  --bg-primary: #1A1025
  --bg-secondary: #241835
  --bg-card: #2D1F42
  --heading-color: #FF9999
  --text-primary: #E8DFF5
  --accent: #FF9999
  --border: #3D2D55
```

### Typography
- Font: Inter (Google Fonts)
- All headings: color var(--heading-color), font-weight 700
- Body: 15px, line-height 1.8

---

## DATABASE SCHEMA (SQLite via better-sqlite3)

```sql
CREATE TABLE page_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL, page_id TEXT NOT NULL,
  confidence_marked INTEGER DEFAULT 0, marked_at DATETIME,
  UNIQUE(chapter_id, page_id)
);

CREATE TABLE question_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL, question_id TEXT NOT NULL,
  attempt_text TEXT, submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revealed_answer INTEGER DEFAULT 0
);

CREATE TABLE quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL, quiz_id TEXT NOT NULL,
  selected_option TEXT, is_correct INTEGER DEFAULT 0,
  attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_date DATE NOT NULL UNIQUE, duration_minutes INTEGER DEFAULT 0,
  chapters_touched TEXT
);

CREATE TABLE question_review_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id TEXT NOT NULL, question_id TEXT NOT NULL,
  scheduled_date DATE NOT NULL, attempt_count INTEGER DEFAULT 1,
  is_correct INTEGER DEFAULT 0, next_review_interval INTEGER,
  UNIQUE(chapter_id, question_id, scheduled_date)
);

CREATE TABLE quiz_battle_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT UNIQUE,
  session_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  questions_count INTEGER DEFAULT 5, time_limit_minutes INTEGER DEFAULT 10,
  questions_answered INTEGER DEFAULT 0, score_achieved INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 5, duration_seconds INTEGER, completed INTEGER DEFAULT 0
);

CREATE TABLE study_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL UNIQUE, studied INTEGER DEFAULT 0,
  study_duration_minutes INTEGER DEFAULT 0
);
```

Export functions: markPageConfident, unmarkPageConfident, isPageConfident, getChapterProgress, getOverallProgress, saveQuizAttempt, getChapterQuizScore, getStudyStreak, getStreakCalendar, getWeeklyStudyTime

---

## KEY COMPONENT BEHAVIORS

### Sidebar
- All 18 chapters listed with short titles
- Active chapter highlighted with accent color
- Exam countdown at bottom: "40 days to ACCA AFM"
- Collapsible on mobile

### Chapter Content Page
- Renders chapter HTML via dangerouslySetInnerHTML
- Arrow navigation: ← Previous / Next → buttons, "Page X of Y"
- Keyboard support: left/right arrow keys navigate pages
- Confidence marker at bottom: "Mark as Understood" toggle button
- NO confidence rating while scraping — just display content

### Question Card
- Expandable accordion showing question number + marks
- Answer textarea for user input
- 45-second timer OR typing unlocks "Show Answer" button
- Dual answer panel: AI step-by-step (left) + Official ACCA (right)
- Since no API key: AI answer shows placeholder text

### Quiz Card
- 4 options (A/B/C/D) as clickable cards
- Immediate correct/incorrect feedback with icons
- Expandable explanation showing why each wrong option is wrong

### Flashcard Deck
- Card flip animation (CSS 3D transform)
- Front/back display
- Previous/Next navigation + card counter
- Keyboard: Space to flip, arrows to navigate

### Mind Map
- Collapsible tree structure
- Color-coded by depth (maroon → violet → grey)
- Expand All / Collapse All buttons

### Dashboard
- Overall progress ring (SVG donut)
- Study streak widget with calendar heatmap
- Per-chapter list showing: title, page count, scraped status
- Quick links: Daily Challenge, Quiz Battle, Exam Simulation, Analytics

---

## API ROUTES

### GET /api/content/metadata
Returns metadata.json (chapter index with stats)

### GET /api/content/[chapter]
Returns full chapter.json for the given chapter ID

### GET /api/content/[chapter]?type=questions|quiz|flashcards|mindmap|cr-exam
Returns specific content type JSON

### POST /api/progress
Body: { chapterId, pageId, action: "mark"|"unmark", questionId, quizId, selectedOption, isCorrect }
Updates SQLite database

### GET /api/progress?type=streak|calendar|weekly|overall
Returns progress data

---

## PRE-LOADED CHAPTER 1 DATA

The file `content/chapters/ch01/chapter.json` must contain 25 pages:
1. Visual Overview
2. 1.1.1 To Achieve Organisational Goals
3. 1.1.2 Financial Management
4. 1.2.1 Corporate Objectives in Practice
5. 1.2.2 Maximisation of Shareholder Wealth
6. 1.2.3 Communication to Stakeholders
7. 1.3.1 Agency Theory
8. 1.3.2 Stakeholders
9. 1.3.3 Directors and Shareholders
10. 1.3.4 Goal Congruence
11. 1.4.1 Ethical Contexts for the Financial Executive
12. 1.4.2 Ethical Decision-Making
13. 1.4.3 Ethical Decision-Making Models (EDMM)
14. 1.4.4 Ethics: Agency Issues and Stakeholder Conflicts
15. 1.5.1 Sustainability
16. 1.5.2 Triple Bottom-Line Reporting (TBL or 3BL)
17. 1.5.3 Modern Approaches to Reporting ESG Issues
18. 1.6.1 Need for Risk Management
19. 1.6.2 Conflicts Between Equity and Debt Investors
20. 1.6.3 Types of Risk and Risk Mitigation
21. 1.6.4 Risk Mitigation, Hedging and Diversification
22. 1.6.5 Developing a Framework for Risk Management
23. Syllabus Coverage
24. Summary and Quiz
25. Technical Articles

Each page has realistic ACCA-style content with:
- Definition tables (table-style1)
- Bullet lists with checkmarks/x-marks
- Exam advice boxes
- Expandable activity sections
- Image references (ACCA S3 URLs)

Generate REALISTIC exam content for each page — not placeholders. This is for ACCA AFM (Advanced Financial Management).

---

## .env.example CONTENT

```
ACCA_PORTAL_USERNAME=your_acca_username
ACCA_PORTAL_PASSWORD=your_acca_password
ACCA_PORTAL_BASE_URL=https://studymaterials.accaglobal.com
NEXT_PUBLIC_EXAM_DATE=2026-06-05
NEXT_PUBLIC_APP_NAME=AFM Study Hub
NEXT_PUBLIC_EXAM_NAME=ACCA AFM
CONTENT_DIR=./content/chapters
MEDIA_BASE_URL=/content/chapters
NODE_ENV=development
```

---

## package.json DEPENDENCIES

```json
{
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.5.3",
    "tailwindcss": "^3.4.6",
    "postcss": "^8.4.39",
    "autoprefixer": "^10.4.19",
    "zustand": "^4.5.4",
    "better-sqlite3": "^11.1.2",
    "lucide-react": "^0.408.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.11",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/better-sqlite3": "^7.6.11"
  }
}
```

---

## SETUP INSTRUCTIONS (after generating code)

```bash
# 1. Create project folder
mkdir afm-study-hub && cd afm-study-hub

# 2. [Paste all generated files here]

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env.local
# Edit .env.local — set exam date to 2026-06-05

# 5. Start the app
npm run dev

# 6. Open http://localhost:3000
# Chapter 1 is ready with 25 pages of content
```

---

## DELIVERABLE

Generate EVERY file listed above with COMPLETE working code. No stubs, no comments saying "implement here". The app must:
1. Run with `npm run dev` immediately after `npm install`
2. Show the dashboard with Chapter 1 visible
3. Navigate through all 25 Chapter 1 pages with arrow keys
4. Display content with proper styling (maroon headings, definition tables, etc.)
5. Toggle dark/light mode
6. Show exam countdown (40 days to ACCA AFM)
7. All tabs work: Content, Questions, Quiz, Flashcards, Mind Map, CR Exam

Start generating files now.
