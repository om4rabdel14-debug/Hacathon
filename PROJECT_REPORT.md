# AI Waste Report & Priority System
## Full Project Report

---

## 1. Project Overview

**Project Name:** AI Waste Report & Priority System  
**Type:** Smart municipal waste management platform  
**Purpose:** Connect citizens with municipality staff through AI-powered waste reporting, classification, prioritization, and tracking.

### The Problem
Traditional waste reporting in municipalities relies on phone calls, WhatsApp messages, Facebook posts, and in-person visits. This leads to:
- Delayed responses
- Lost reports
- No priority system
- Reports reaching the wrong department
- No tracking or accountability
- Repeated problems in the same areas

### The Solution
A digital platform where:
1. Citizens submit waste reports (image + description + location)
2. AI (Google Gemini) analyzes the image and text
3. System classifies the issue, assigns severity, calculates priority
4. Report is automatically routed to the correct municipal department
5. Municipality staff manage reports through a dashboard
6. Citizens track their report status in real-time

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express v5 |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Authentication | Supabase Auth |
| AI Engine | Google Gemini 2.0 Flash |
| Validation | Zod |
| Logging | Winston |
| Security | Helmet + CORS |
| File Upload | Multer (memory storage) |

---

## 3. Project Architecture

```
backend/
├── src/
│   ├── app/                          # Express application layer
│   │   ├── app.js                    # Express setup, middleware, routes
│   │   ├── server.js                 # Server entry point
│   │   ├── routes.js                 # Central route mounting
│   │   └── middlewares/
│   │       ├── auth.middleware.js     # JWT Bearer token verification
│   │       ├── error.middleware.js    # Global error handler
│   │       ├── notFound.middleware.js # 404 handler
│   │       └── validate.middleware.js # Zod validation middleware
│   │
│   ├── config/                       # Configuration
│   │   ├── env.js                    # Environment variable loader
│   │   ├── supabase.js               # Supabase client
│   │   ├── gemini.js                 # Gemini AI client
│   │   └── logger.js                 # Winston logger
│   │
│   ├── core/                         # Core business logic
│   │   ├── constants/                # Enums and mappings
│   │   │   ├── reportStatus.js       # Status lifecycle + transitions
│   │   │   ├── issueTypes.js         # Waste type classifications
│   │   │   ├── severityLevels.js     # Severity levels
│   │   │   └── departments.js        # Department routing rules
│   │   ├── errors/                   # Custom error classes
│   │   │   ├── AppError.js           # Base error class
│   │   │   ├── BadRequestError.js    # 400 errors
│   │   │   ├── NotFoundError.js      # 404 errors
│   │   │   └── UnauthorizedError.js  # 401 errors
│   │   ├── utils/                    # Utility functions
│   │   │   ├── asyncHandler.js       # Async route wrapper
│   │   │   ├── buildApiResponse.js   # Standard API response format
│   │   │   ├── calculatePriority.js  # Hybrid priority scoring
│   │   │   ├── fileHelpers.js        # File naming utilities
│   │   │   └── parseGeminiJson.js    # Gemini response parser
│   │   └── validators/               # Input validation schemas
│   │       ├── report.validator.js   # Report creation/update schemas
│   │       └── auth.validator.js     # Login schema
│   │
│   ├── modules/                      # Feature modules
│   │   ├── reports/                  # Citizen report submission
│   │   │   ├── reports.routes.js
│   │   │   ├── reports.controller.js
│   │   │   ├── reports.service.js    # Core orchestration logic
│   │   │   ├── reports.repository.js
│   │   │   ├── reports.mapper.js
│   │   │   └── reports.schemas.js
│   │   ├── dashboard/                # Municipality dashboard
│   │   │   ├── dashboard.routes.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── dashboard.service.js
│   │   │   └── dashboard.repository.js
│   │   ├── auth/                     # Authentication
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.schemas.js
│   │   ├── resolution/               # Report resolution management
│   │   │   ├── resolution.routes.js
│   │   │   ├── resolution.controller.js
│   │   │   ├── resolution.service.js
│   │   │   └── resolution.repository.js
│   │   └── notifications/            # Notification service
│   │       ├── notifications.service.js
│   │       └── notifications.repository.js
│   │
│   ├── integrations/                 # External service integrations
│   │   ├── ai/                       # Gemini AI integration
│   │   │   ├── gemini.client.js      # Gemini API calls
│   │   │   ├── aiAnalysis.service.js # Analysis pipeline orchestrator
│   │   │   ├── prompts/
│   │   │   │   ├── analyzeWaste.prompt.js    # Main analysis prompt
│   │   │   │   └── summarizeReport.prompt.js # Summary prompt
│   │   │   └── transformers/
│   │   │       └── geminiResponse.transformer.js # Response validation
│   │   ├── storage/                  # Supabase Storage
│   │   │   ├── storage.service.js
│   │   │   └── supabaseStorage.client.js
│   │   └── database/                 # Database layer
│   │       ├── supabase.client.js
│   │       └── base.repository.js    # Base CRUD operations
│   │
│   ├── shared/                       # Shared utilities
│   │   ├── dto/                      # Data transfer objects
│   │   │   ├── report.dto.js
│   │   │   └── dashboard.dto.js
│   │   ├── types/
│   │   │   └── common.types.js
│   │   └── helpers/
│   │       └── date.helper.js
│   │
│   └── scripts/
│       └── seed.js                   # Database seeding script
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Database schema
│
├── package.json
├── .env
└── .env.example
```

**Total: 60 source files | ~2,139 lines of code**

---

## 4. Database Schema

### Table: `reports`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated unique ID |
| image_url | TEXT | Uploaded waste image URL |
| description | TEXT | Citizen's description |
| lat | DOUBLE PRECISION | Latitude |
| lng | DOUBLE PRECISION | Longitude |
| address | TEXT | Human-readable address |
| citizen_name | TEXT | Reporter's name |
| citizen_email | TEXT | Optional email |
| issue_type | TEXT | AI-classified waste type |
| severity | TEXT | low / medium / high / critical |
| confidence | DOUBLE PRECISION | AI confidence (0.0 - 1.0) |
| ai_summary | TEXT | AI-generated summary |
| severity_explanation | TEXT | Why this severity was assigned |
| recommended_department | TEXT | AI-recommended department |
| priority_score | INTEGER | Hybrid priority (1-10) |
| priority_level | TEXT | low / medium / high / urgent |
| status | TEXT | Current lifecycle status |
| assigned_department | TEXT | Assigned municipal department |
| duplicate_of_report_id | UUID (FK) | Points to the primary report if this submission was merged |
| submission_count | INTEGER | Total citizen submissions merged into the primary report |
| merged_at | TIMESTAMPTZ | When this submission was merged into another report |
| sla_due_at | TIMESTAMPTZ | Deadline before escalation starts |
| escalation_level | INTEGER | Current escalation level (0-5) |
| escalation_stage | TEXT | Current escalation stage label |
| last_escalated_at | TIMESTAMPTZ | Last automatic escalation timestamp |
| next_escalation_at | TIMESTAMPTZ | When the next escalation level should trigger |
| resolved_at | TIMESTAMPTZ | When the case was marked resolved |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Auto-updated on changes |

### Table: `report_updates` (Timeline)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| report_id | UUID (FK) | References reports |
| old_status | TEXT | Previous status |
| new_status | TEXT | New status |
| note | TEXT | Description of change |
| changed_by | TEXT | Who made the change |
| changed_at | TIMESTAMPTZ | When it happened |

### Table: `resolution_images` (Before/After)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| report_id | UUID (FK) | References reports |
| image_url | TEXT | Resolution proof image URL |
| caption | TEXT | Optional caption |
| uploaded_at | TIMESTAMPTZ | Upload timestamp |

### Table: `report_feedback`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| report_id | UUID (FK) | Primary report being evaluated |
| submission_report_id | UUID (FK) | Original citizen submission |
| citizen_name | TEXT | Reviewer name |
| citizen_email | TEXT | Optional reviewer email |
| rating | INTEGER | Rating from 1 to 5 |
| resolved_confirmed | BOOLEAN | Whether the citizen confirms the issue was solved |
| comment | TEXT | Optional feedback comment |
| created_at | TIMESTAMPTZ | When feedback was submitted |

### Table: `report_escalations`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| report_id | UUID (FK) | Primary report being escalated |
| level | INTEGER | Escalation level (1-5) |
| stage | TEXT | Stage key |
| note | TEXT | Escalation note |
| triggered_at | TIMESTAMPTZ | When escalation was recorded |

### Storage Buckets
- `report-images` — Citizen waste photos (public read)
- `resolution-images` — Staff resolution proof photos (public read)

---

## 5. API Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/reports` | Submit a waste report (multipart: image + fields) |
| GET | `/api/reports/:id` | Get a single report |
| GET | `/api/reports/track/:id` | Citizen tracking (report + timeline + resolution images) |
| GET | `/api/reports/:id/updates` | Get report timeline |
| GET | `/api/reports/:id/duplicates` | Get merged duplicate submissions for the primary case |
| POST | `/api/reports/:id/feedback` | Citizen rates the solution after resolution |
| GET | `/api/reports/:id/feedback-summary` | Aggregate citizen satisfaction for a case |
| GET | `/api/reports/:id/escalation` | Current escalation state + escalation history |
| GET | `/api/location/reverse-geocode?lat=...&lng=...` | Resolve coordinates into a human-readable address |
| POST | `/api/auth/login` | Municipality staff login |

### Protected Endpoints (Bearer Token Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics (totals, by status, by priority) |
| GET | `/api/dashboard/reports` | Paginated + filtered reports list |
| PATCH | `/api/resolution/reports/:id/status` | Update report status |
| POST | `/api/resolution/reports/:id/notes` | Add admin note to timeline |
| POST | `/api/resolution/reports/:id/resolution-images` | Upload resolution proof image |

### New Workflow Additions

#### Duplicate Detection and Merge
- New reports are reverse-geocoded, analyzed by AI, then checked against nearby open cases with the same `issue_type`.
- If a match is found within a small radius, the new submission is marked as `merged` and linked to the primary report.
- The primary report increments `submission_count`, so 5 citizens in the same place strengthen one municipal case instead of creating 5 parallel cases.

#### Solution Evaluation
- Once a report reaches `resolved`, citizens can submit a 1-5 rating plus a boolean confirmation of whether the issue was actually fixed.
- Feedback is aggregated into `feedback_summary` for trust and accountability metrics.

#### Escalation Ladder
- Each report gets an `sla_due_at` based on priority level.
- After the deadline passes, the report moves through:
- Level 1: Internal escalation (up to 3 overdue days)
- Level 2: Institutional pressure (up to 7 overdue days)
- Level 3: Community pressure (up to 14 overdue days)
- Level 4: Legal documentation (up to 30 overdue days)
- Level 5: External intervention (more than 30 overdue days)

### API Response Format
```json
{
  "success": true,
  "message": "Description",
  "data": { ... }
}
```

### Paginated Response Format
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## 6. AI Integration Details

### How AI Works in This System

**Engine:** Google Gemini 2.0 Flash (multimodal - understands images + text)

**Analysis Pipeline:**
1. Citizen uploads image + writes description
2. Image is converted to base64 and sent to Gemini along with a carefully engineered prompt
3. Gemini analyzes both the image AND the text description together
4. Returns structured JSON classification
5. Response is validated and normalized by the transformer
6. Hybrid priority score is calculated
7. Report is updated with all AI fields

### What AI Returns
```json
{
  "is_valid_waste_report": true,
  "issue_type": "overflowing_bin",
  "severity": "high",
  "confidence": 0.95,
  "summary": "Overflowing waste container near a school entrance posing health risks.",
  "severity_explanation": "High severity due to proximity to school and waste spilling onto walkway.",
  "recommended_department": "Sanitation"
}
```

### Waste Types AI Can Classify
| Type | Description |
|------|-------------|
| overflowing_bin | Full/overflowing waste container |
| illegal_dumping | Waste dumped in unauthorized areas |
| construction_debris | Building materials, rubble |
| scattered_garbage | Loose garbage on streets |
| burning_waste | Waste being burned |
| broken_container | Damaged waste container |
| invalid | Not a waste-related issue |

### Department Routing (AI-Driven)
| Waste Type | Routed To |
|------------|-----------|
| overflowing_bin | Sanitation |
| scattered_garbage | Sanitation |
| illegal_dumping | Field Operations |
| construction_debris | Field Operations |
| burning_waste | Emergency / Environment |
| broken_container | Container Maintenance |

---

## 7. Priority Calculation System

The system uses a **Hybrid Priority Algorithm** combining AI analysis with business rules.

### Base Score (from AI severity)
| Severity | Base Score |
|----------|-----------|
| low | 1 |
| medium | 3 |
| high | 5 |
| critical | 7 |

### Bonus Points
| Factor | Bonus |
|--------|-------|
| AI confidence > 90% | +1 |
| Burning waste | +3 |
| Illegal dumping | +1 |
| Construction debris | +1 |
| Near school/hospital | +2 |
| Repeated reports in area | +2 |
| Delayed resolution | +1 |

### Priority Levels
| Score Range | Level | Color |
|-------------|-------|-------|
| 1 - 3 | Low | Green |
| 4 - 6 | Medium | Yellow |
| 7 - 8 | High | Orange |
| 9 - 10 | Urgent | Red |

**Example:** Burning waste (critical severity = 7) + high confidence (+1) + dangerous type (+3) = **Score 10 → URGENT**

---

## 8. Report Lifecycle

```
Submitted → Analyzing → Assigned → In Progress → Resolved
                           ↓                        
                        Rejected                     
```

| Status | Description | Changed By |
|--------|-------------|------------|
| submitted | Citizen sent the report | Citizen |
| analyzing | AI is processing | System |
| assigned | AI done, routed to department | AI |
| in_progress | Staff started working on it | Admin |
| resolved | Problem fixed | Admin |
| rejected | Not a valid waste report | AI / Admin |

### Valid Status Transitions
- submitted → analyzing, rejected
- analyzing → assigned, rejected
- assigned → in_progress, rejected
- in_progress → resolved, assigned (reassign)
- resolved → (terminal)
- rejected → (terminal)

---

## 9. Security

| Feature | Implementation |
|---------|---------------|
| Authentication | Supabase Auth (JWT tokens) |
| Authorization | Bearer token middleware on admin routes |
| Input Validation | Zod schemas on all endpoints |
| File Validation | Multer: images only, 10MB max |
| SQL Injection | Prevented by Supabase client (parameterized queries) |
| CORS | Restricted to frontend origin |
| Headers | Helmet security headers |
| RLS | Row Level Security enabled on all tables |
| Service Key | Backend uses service role key (never exposed to frontend) |

---

## 10. Test Results

| Test | Status |
|------|--------|
| Server startup | PASS |
| Health check endpoint | PASS |
| Admin login (Supabase Auth) | PASS |
| Dashboard stats (authenticated) | PASS |
| Dashboard stats (unauthenticated) | Correctly returns 401 |
| Database seeding (12 reports) | PASS |
| Image upload to Supabase Storage | PASS |
| Report creation with image | PASS |
| AI analysis pipeline | Code correct, needs valid API key quota |

---

## 11. Seed Data

The system includes a seeding script that populates 12 demo reports:

| # | Type | Severity | Priority | Status |
|---|------|----------|----------|--------|
| 1 | Overflowing bin | High | High (8) | Assigned |
| 2 | Illegal dumping | Critical | Urgent (9) | In Progress |
| 3 | Construction debris | Medium | Medium (5) | Assigned |
| 4 | Broken container | Medium | Medium (5) | Resolved |
| 5 | Burning waste | Critical | Urgent (10) | Resolved |
| 6 | Scattered garbage | Medium | Medium (5) | In Progress |
| 7 | Overflowing bin | High | High (7) | Assigned |
| 8 | Illegal dumping | High | High (7) | Submitted |
| 9 | Scattered garbage | Low | Low (2) | Resolved |
| 10 | Construction debris | High | High (8) | In Progress |
| 11 | Overflowing bin | Critical | Urgent (10) | Assigned |
| 12 | Broken container | High | High (7) | Assigned |

Each report includes full timeline entries showing the status progression.

---

## 12. How to Run

### Prerequisites
- Node.js 18+
- Supabase project with tables created
- Google Gemini API key with available quota

### Setup
```bash
cd backend
npm install
# Fill in .env with your keys
npm run seed    # Populate demo data
npm run dev     # Start development server
```

### Environment Variables
```
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
```

---

## 13. Known Issues & Notes

1. **Gemini API Quota:** The current API key has exhausted its free tier quota. A new key or billing-enabled key is needed for AI analysis to work.
2. **AI Fallback:** When AI fails, reports are saved in "submitted" status with a timeline note indicating manual review is needed. No data is lost.
3. **Context Factors:** The priority system supports bonus factors like "near school" and "repeated area" but these require geo-lookup integration (stubbed for hackathon).
4. **Citizen Auth:** Citizens don't need to log in. They track reports by UUID - simpler for hackathon scope.

---

## 14. What Makes This Project Stand Out

1. **Real AI Integration** — Not just a wrapper. Gemini analyzes images AND text together to produce structured classifications.
2. **Hybrid Priority System** — Combines AI intelligence with business rules (danger type, location sensitivity, confidence scoring).
3. **Complete Lifecycle** — From citizen report to municipal resolution with full timeline tracking.
4. **Before/After Proof** — Resolution images provide visual proof of problem resolution.
5. **Department Routing** — Automatic routing based on waste type ensures the right team handles each report.
6. **Severity Explanation** — AI explains WHY it assigned a severity level, making decisions transparent.
7. **Professional Architecture** — Clean separation: modules, services, repositories, validators, DTOs.
