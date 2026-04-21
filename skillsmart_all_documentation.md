# SkillSmart

## Project Description
Project Blueprint: SkillSmart
"Don't just apply. Qualify."

1. The Core Vision
Mission: To turn job rejections into actionable growth paths.

Primary User: The "Near-Miss" Applicant (the 80% match).

The "Vibe": Professional, encouraging, high-tech, and transparent.

2. Technical Stack (The Engine)
Frontend: [ e.g., Laravel Blade + Tailwind CSS ]

Why: Fast UI development and clean, responsive design.

Backend: [ e.g., Laravel / PHP ]

Why: Robust routing and easy integration with recruitment APIs.

Database: [ e.g., MySQL / PostgreSQL ]

Why: Structured data for storing user skills and job requirements.

AI Engine: [ e.g., OpenAI API / Gemini API ]

Logic: Semantic analysis to compare Resume (PDF) vs. Job Description (Text).

3. Feature Roadmap (The "What")
[ ] AI Resume Diagnostic: Upload PDF → Get "Gap Report."

[ ] The Bridge: Automated course/video recommendations based on missing skills.

[ ] Verified Badges: Small coding challenges or quizzes to "unlock" missing skills.

[ ] Recruiter Dashboard: View candidates who have successfully "Upskilled."

4. "Vibe" & Design Language
Color Palette: [ e.g., Deep Navy (Trust), Electric Blue (Action), and White (Clarity) ]

Typography: [ e.g., Inter / Montserrat ] — Clean, modern sans-serif.



Tech Stack :
React 
Tailwind
Supabase


Objective 
Build a simple web application that: 
• Extracts skills from a resume or input text 
• Matches users to relevant jobs 
• Identifies missing skills (skill gap) 
• Recommends learning resources 

Objective 
Build a simple web application that: 
• Extracts skills from a resume or input text 
• Matches users to relevant jobs 
• Identifies missing skills (skill gap) 
• Recommends learning resources 


## Product Requirements Document
# Product Requirements Document: SkillSmart

## 1. Executive Summary
SkillSmart is a career-accelerator platform designed to transition "near-miss" applicants into qualified candidates. By bridging the gap between current professional profiles and specific job requirements, SkillSmart provides actionable feedback, closing the distance between rejection and hiring.

## 2. Project Vision
Mission: To transform job rejections into structured, actionable growth paths.
Core Value Proposition: "Don't just apply. Qualify."
Primary User: The "Near-Miss" Applicant who possesses 70-80% of required skills but lacks the specific credentials to clear automated screening.

## 3. Technical Specifications
### 3.1 Architecture
- Frontend: React (Vite)
- Styling: Tailwind CSS
- Backend/Database: Supabase (Auth, PostgreSQL, Storage)
- AI Engine: OpenAI API (GPT-4o) for semantic analysis and gap identification

### 3.2 Security & Auth
- Authentication: Email/Password (Optional for MVP to reduce friction)
- Data Privacy: Temporary storage of resumes in Supabase Storage; purging policies to ensure user data security.

## 4. Functional Requirements
### 4.1 Input Modules
- Resume Upload: User uploads a PDF/Docx. System uses Supabase storage to trigger an extraction service.
- Job Description Input: User pastes job description text into a textarea component.

### 4.2 AI Logic & Analysis
- Skill Extraction: AI scans resume text and job description to tokenize and categorize hard/soft skills.
- Gap Identification: The logic must perform a comparative analysis to generate an explicit list of "Required Skills" vs "Found Skills."
- Scoring: A percentage match score based on the weighted importance of skills found in the job description.

### 4.3 Learning Recommendation Engine
- Data Sources: Hybrid approach using external API integrations (e.g., YouTube/Udemy) and static manual resource mapping.
- Output: A personalized "Roadmap" interface showing missing skills paired with specific video/article links.

## 5. UI/UX Workflow (Step-by-Step)
Step 1: Upload. User provides resume and pastes the target job description.
Step 2: Processing. Minimalist loading state indicating AI analysis.
Step 3: Diagnostic Report. A clean dashboard displaying:
  - Match Score (%).
  - Skill Gap Table (Found vs. Missing).
Step 4: Upskilling Path. A clickable list of recommendations to resolve gaps.

## 6. Feature Roadmap
- Phase 1 (MVP): Basic extraction, gap analysis, and manual resource suggestions.
- Phase 2: Verified Badges (Quick quizzes to prove a skill exists despite lacking it on a resume).
- Phase 3: Recruiter Dashboard (Shared view for candidates to prove their "upskilled" status to employers).

## 7. Performance & Quality Constraints
- Latency: Resume extraction and AI analysis must be completed within 8-12 seconds.
- Accuracy: AI must provide a "Reasoning" field for why a skill was marked as missing to ensure transparency.
- Responsiveness: Fully fluid UI using Tailwind breakpoints for desktop and mobile efficiency.

## 8. Branding & Aesthetic
- Palette: Deep Navy (Trust), Electric Blue (Action), and White (Clarity).
- Typography: Inter/Montserrat (Modern, highly readable).
- Tone: Professional, encouraging, and high-tech.

## Technology Stack
# TECHSTACK: SkillSmart

## 1. Overview
The SkillSmart technology stack is selected to prioritize rapid development, real-time data handling, and seamless integration with Large Language Models (LLMs). The architecture follows a modern, serverless-first approach to minimize infrastructure overhead while ensuring high performance for AI-driven text analysis.

## 2. Frontend: React
- Framework: React (Vite)
- Justification: React offers a component-based architecture that is ideal for the "step-by-step" UI/UX requirement. It allows for modular building of the resume uploader, the skill-gap visualization dashboard, and the learning resource cards. Vite is utilized to ensure lightning-fast hot module replacement during development.

## 3. Styling: Tailwind CSS
- Justification: Tailwind provides a utility-first approach that aligns perfectly with the goal of a clean, professional, and "high-tech" aesthetic. It enables rapid prototyping of the step-by-step interface without needing custom CSS files, ensuring consistency across all screens.

## 4. Backend & Database: Supabase
- Database: PostgreSQL (via Supabase)
- Auth: Supabase Auth (Optional/Email-Password)
- Storage: Supabase Storage (For PDF resume uploads)
- Justification: Supabase provides a powerful managed PostgreSQL database. Its built-in Row Level Security (RLS) handles user data privacy out-of-the-box, while Supabase Storage serves as the ideal location for storing uploaded resume PDFs for subsequent AI extraction.

## 5. AI Engine & Logic
- Provider: Groq Llamma Versatile
- Logic Nuance: The system will perform a two-step semantic comparison:
    1. Extraction: Parse the uploaded PDF/text to create a structured JSON list of existing user skills.
    2. Gap Analysis: Compare the extracted JSON against the manually input Job Description. The logic will strictly identify the delta between the two, specifically flagging "Missing Skills" that prevent a full match.
- Integration: Serverless Functions (Supabase Edge Functions) will act as the middleware, calling the OpenAI API securely without exposing private keys to the client.

## 6. Infrastructure & Deployment
- Hosting: Vercel (for the React frontend)
- Justification: Vercel offers native support for Vite-based React apps and seamless integration with Supabase, providing an optimized global CDN for the application assets.

## 7. Data Flow Summary
1. User inputs Job Description text and uploads PDF Resume.
2. Frontend sends raw data to Supabase Edge Function.
3. Edge Function triggers GROQ API to perform skill extraction and semantic gap analysis.
4. OpenAI returns a structured response containing: Missing Skills, Gap Severity, and curated Learning Resources (Links/Courses).
5. React frontend renders the step-by-step results dashboard.

## Project Structure
PROJECTSTRUCTURE: SkillSmart

1. Overview
This project follows a clean, modular architecture leveraging React for the frontend, Tailwind CSS for styling, and Supabase for backend services (database, authentication, and storage). The project is organized to separate UI components from business logic and AI integration services.

2. Directory Tree
/skillsmart
├── public/              # Static assets (icons, images)
├── src/
│   ├── assets/          # Global styles, fonts, and branding elements
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Buttons, inputs, cards
│   │   ├── layout/      # Navbar, footer, wrappers
│   │   └── dashboard/   # Resume uploader, SkillGap visualizer
│   ├── hooks/           # Custom React hooks (useAuth, useResumeProcessor)
│   ├── lib/             # Third-party configurations (Supabase client)
│   ├── pages/           # Page-level components (Landing, Analyzer, Results)
│   ├── services/        # Logic layer for external integrations
│   │   ├── aiService.js # OpenAI/Gemini integration for skill extraction
│   │   └── supabase.js  # Database CRUD operations
│   ├── store/           # Context API or Zustand for global state
│   ├── utils/           # Helper functions (text parsing, skill matching logic)
│   └── App.jsx          # Root routing component
├── .env                 # API Keys (Supabase/OpenAI)
├── tailwind.config.js   # Tailwind theme customization
└── package.json         # Project dependencies

3. Core Module Explanations
a
- /components/dashboard: Houses the "Step-by-Step" flow. This includes the ResumeDropzone, JobDescriptionInput, and the SkillGapComparison components. Keeping these here ensures the UI logic remains decoupled from data processing.

- /services/aiService.js: The core engine. This module handles communication with the AI provider. It sends the extracted text from the resume and the job description to the model and returns a structured JSON object identifying missing skills.

- /lib/supabase.js: Centralized configuration for the Supabase client. All database calls for saving user uploads or retrieving stored job/learning resource data pass through this module.

- /utils/parser.js: Contains the logic to clean raw text inputs or handle PDF-to-text conversion (if using a client-side parser library like react-pdf) before sending the payload to the AI service.

4. Data Flow Principles
- Step 1: Input Layer: Users submit input via the /pages/Analyzer.jsx route.
- Step 2: Processing Layer: Data flows into /services/aiService.js, where prompt engineering facilitates the comparison logic.
- Step 3: Storage Layer: The resulting "Gap Report" is temporarily stored in the state (Zustand) and persisted to Supabase if the user chooses to save their session.
- Step 4: UI Layer: The results are rendered in the dashboard components, visually differentiating between "Matched Skills" and "Missing Skills."

5. Development Best Practices
- Tailwind CSS classes are kept within components to maintain a tight design system.
- Supabase RLS (Row Level Security) should be implemented to ensure that even if authentication is optional, data integrity remains intact.
- Async operations (API calls) are handled with loading states and error boundaries to maintain a professional "vibe" even during processing delays.

## Database Schema Design
### 3. SCHEMA DESIGN: SkillSmart Database Structure

This section outlines the relational database architecture designed for Supabase (PostgreSQL). The schema is optimized for skill-gap analysis, content association, and matching logic.

---

#### 3.1 Tables Overview

1. users
Stores authentication and profile information. Since email is optional, this table handles session tracking and user-specific data persistence.
- id: uuid (PK)
- email: varchar (Unique, Nullable)
- created_at: timestamp

2. jobs
Stores the source material (Job Descriptions) against which applicants are measured.
- id: uuid (PK)
- title: varchar
- company: varchar
- description_text: text
- raw_skills: jsonb (Array of extracted skills from AI)
- created_at: timestamp

3. resumes
Stores extracted candidate data. Each resume is linked to a user and processed for skill extraction.
- id: uuid (PK)
- user_id: uuid (FK -> users)
- extracted_skills: jsonb (Array of skills found in the candidate's PDF/text)
- resume_text: text
- created_at: timestamp

4. skill_gaps
Acts as the central junction for "The Bridge" logic. This table stores the delta between a resume's skills and a specific job's requirements.
- id: uuid (PK)
- resume_id: uuid (FK -> resumes)
- job_id: uuid (FK -> jobs)
- missing_skills: jsonb (Array of identified missing skills)
- created_at: timestamp

5. learning_resources
Catalogs the content recommended for upskilling.
- id: uuid (PK)
- title: varchar
- url: text
- skill_tag: varchar (The specific skill this resource helps master)
- type: varchar (e.g., 'video', 'course', 'documentation')

6. badges
Tracks "Verified Badges" earned by users to prove proficiency.
- id: uuid (PK)
- user_id: uuid (FK -> users)
- skill_name: varchar
- verified_at: timestamp

---

#### 3.2 Relationships & Keys

- One-to-Many: A user can have multiple resumes (iterations of improvement).
- One-to-Many: A job can be associated with multiple skill_gap records.
- Many-to-Many (via Skill Gap): The application identifies gaps by comparing `resumes.extracted_skills` and `jobs.raw_skills`.
- Indexing: B-Tree indexes are applied to `jobs.title` and `learning_resources.skill_tag` to facilitate rapid lookups during the AI analysis phase.

---

#### 3.3 Data Flow Logic (Schema Implementation)

1. Extraction: When a resume is uploaded, the AI identifies skills and populates the `resumes.extracted_skills` JSONB column.
2. Comparison: The application queries `jobs` and `resumes` to compute the `missing_skills` array for the `skill_gaps` table.
3. Recommendation: The backend performs a join between `skill_gaps.missing_skills` and `learning_resources.skill_tag` to return relevant learning modules to the user interface.

---

#### 3.4 Security Policies (Supabase RLS)

- Public Read: Access to `jobs` and `learning_resources` is public to allow anonymous skill-gap checks.
- User Isolation: Rows in `resumes` and `skill_gaps` are protected by RLS (Row Level Security) to ensure users can only view their own diagnostic reports if they choose to authenticate.
- Immutable Logic: The `skill_gaps` entries are treated as ephemeral reports that can be regenerated upon re-uploading a resume.

## User Flow
# USERFLOW DOCUMENT: SKILLSMART

## 1. OVERVIEW
The SkillSmart user flow is designed as a linear, step-by-step diagnostic journey. It minimizes cognitive load by segmenting the qualification process into three distinct phases: Input, Analysis, and Growth. The flow emphasizes the \"Gap Report\" as the primary value delivery mechanism.

## Judge Prep Companion
For current judge Q and A, scoring formulas, interview scoring logic, and product-defense notes, see `skillsmart_judges_qa.md`.

## 2. DETAILED USER JOURNEYS

### Journey A: The "Qualification" Flow (Primary Path)
1. LANDING PAGE: User is greeted with a clear call-to-action (CTA): \"Identify Your Skill Gaps.\"
2. INPUT STEP 1 (Resume): User uploads a PDF/Text resume. The system uses a loading state (e.g., \"Analyzing professional history...\").
3. INPUT STEP 2 (Job Target): User pastes the Job Description (JD) text. A secondary CTA prompts: \"Run Gap Analysis.\"
4. ANALYSIS ENGINE: The AI Engine (OpenAI/Gemini) processes the delta between the resume and the JD.
5. RESULTS DASHBOARD: User lands on a responsive view displaying:
   - Match Score (Percentage).
   - \"Skills You Have\" (Green checkmarks).
   - \"Missing Skills\" (Red warning indicators).
6. BRIDGE PHASE: For each missing skill, the interface provides a \"Resource Link\" (Course or Video).
7. CALL TO ACTION: \"Verify Your Growth\" leads to a quiz or challenge to prove the newly acquired skill.

## 3. WIREFRAME & UI COMPONENT DESCRIPTIONS

### Screen 1: The Input Interface
- Layout: Split-screen desktop / Stacked mobile.
- UI Components: 
  - File Uploader (React-dropzone): Drag-and-drop area for PDF.
  - Textarea: Expandable field for pasting Job Description text.
  - Action Button: Fixed position, high-contrast \"Run Analysis\" button.

### Screen 2: The Gap Report (Dashboard)
- Header: Overview stats (Match Percentage).
- Visual Hierarchy: A two-column grid showing 'Strengths' vs 'Opportunities'.
- Interaction: Each missing skill card is expandable; clicking it reveals specific learning resource recommendations (YouTube links or platform-specific courses).

### Screen 3: Verification Portal
- Content: Micro-quiz or coding challenge block triggered by the user selecting a skill they have \"bridged.\"
- Interaction: Real-time validation feedback (Success/Retry states).

## 4. INTERACTION PATTERNS
- Progress Indicators: Use a stepper component at the top of the screen to indicate status (Upload -> Analyze -> Grow).
- Feedback Loops: 
  - Loading states: Use Tailwind skeleton screens while the AI processes inputs.
  - Toast Notifications: Confirm when a file is successfully parsed.
- Data Persistence (Supabase): 
  - If the user provides an optional email, the Gap Report is linked to a user_id for future retrieval.
  - If anonymous, data is stored in session storage or temporary database rows with a 24-hour TTL (Time-to-Live).

## 5. TECHNICAL FLOW LOGIC
1. POST Request -> AI Engine (Extract Skills).
2. POST Request -> AI Engine (Compare Array A vs Array B).
3. RETURN JSON -> UI Component (Map skills to React state).
4. RENDER -> Dynamic list based on severity of missing skill.

## 6. NAVIGATION HIERARCHY
- Root Path (/) -> Landing/Input.
- /analysis/:id -> Resulting Gap Report.
- /verify/:skill_id -> Skill challenge interface.

## 7. UX PRINCIPLES APPLIED
- Progressive Disclosure: Do not show learning resources until the gap analysis is confirmed to keep the screen uncluttered.
- Clarity: High-contrast typography (Inter) used for readability of technical skill names.
- Speed: Instant feedback provided via Supabase edge functions to reduce perceived latency during AI analysis.

## Styling Guidelines
# STYLING GUIDELINES: SKILLSMART

## 1. Design Philosophy
SkillSmart is built on the core principle of "Empowered Progression." The UI must strip away the anxiety of rejection and replace it with clear, actionable data. 
- Professionalism: Clean layouts, ample whitespace, and high-contrast text for readability.
- Transparency: Direct, jargon-free feedback for the user regarding their skill gaps.
- High-Tech Clarity: A streamlined interface that focuses on the "Bridge" between current and required skills.
- Step-by-Step Focus: Given the "step-by-step" UI/UX priority, all interactions must be modular, ensuring the user is never overwhelmed by data density.

## 2. Color Palette
Our palette conveys trust (Deep Navy), intelligence (Electric Blue), and clarity (Neutral Whites/Grays).

- Primary Action: Electric Blue (#3B82F6) — Used for "Upskill" buttons, call-to-actions, and progress indicators.
- Structural Base: Deep Navy (#1E293B) — Used for headers, navigation bars, and primary typography.
- Background/Surface: Off-White (#F8FAFC) to Pure White (#FFFFFF) — Used for content cards to ensure the interface feels airy and modern.
- Feedback (Semantic):
  - Missing Skill (Alert): Soft Amber (#F59E0B)
  - Success/Verified: Emerald (#10B981)
  - Error/Attention: Rose (#F43F5E)

## 3. Typography
We utilize sans-serif fonts to ensure modern readability across all devices.

- Primary Typeface: 'Inter'
  - Usage: All UI components, labels, buttons, and body text.
  - Rationale: Exceptional legibility and a neutral, professional aesthetic.
- Secondary Typeface: 'Montserrat' (for headings)
  - Usage: Page titles and promotional headers.
  - Rationale: Adds a touch of geometric authority and brand personality.
- Scale:
  - Headings: Bold, clean, and spacious.
  - Body: 16px minimum for accessibility and comfortable reading.
  - Labels: Semi-bold, 12-14px, often utilizing letter-spacing for distinction.

## 4. UI/UX Principles (The "Step-by-Step" Workflow)
Since the application relies on an iterative diagnostic process, the interface must strictly follow these behavioral rules:

- The "Diagnostic Funnel": The user flow should never present the entire process at once. 
  - Step 1: Input (Resume/Job Desc)
  - Step 2: Processing (Loading states with specific messaging)
  - Step 3: Gap Analysis (Visual highlights of missing skills)
  - Step 4: Action (Recommendations)
- Visual Hierarchy: Use Tailwind CSS utility classes to ensure the most important information (the skill gap) is visually dominant.
- Loading States: Use subtle skeleton loaders while the AI performs the semantic analysis to maintain an illusion of speed and stability.
- Component Styling:
  - Cards: Apply shadow-sm and rounded-lg to create a contained, professional feel for each skill module.
  - Buttons: Use consistent padding, transition-colors, and hover-states to provide satisfying feedback.
  - Progress Bars: Utilize clear, linear progress bars to track the journey from "Applicant" to "Qualified."

## 5. Technical Implementation (Tailwind CSS)
- Design Tokens: Maintain consistency by defining theme values in `tailwind.config.js` for custom colors and font stacks.
- Mobile-First: All layouts must be mobile-responsive by default. Stack inputs vertically on mobile and utilize wider grids only on desktop layouts.
- Accessibility (A11y): Ensure all interactive elements have sufficient contrast ratios (WCAG 2.1 Level AA) and visible focus states for keyboard navigation.
