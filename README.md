# 🤖 ATS System — AI-Powered Applicant Tracking System

A full-stack, production-grade Applicant Tracking System built with **ASP.NET Core (.NET 10)**, **Entity Framework Core**, **MS SQL Server**, and **React (TypeScript)**. Features AI-powered resume analysis using OpenAI GPT, keyword matching, and a real-time candidate ranking engine.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Default Seeded Accounts](#default-seeded-accounts)
- [Database Schema](#database-schema)
- [AI Analysis Engine](#ai-analysis-engine)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## 🧭 Overview

ATS System is a startup-grade MVP that connects **candidates** and **recruiters** through an intelligent matching engine. Candidates upload their resumes and apply to jobs — the system automatically runs an AI analysis comparing the resume against the job description, returning a match score, missing keywords, strengths, and actionable suggestions.

Recruiters can post jobs, view ranked candidates, and manage application statuses — all from a clean, modern dashboard.

---

## 🎯 Features

### Candidate Side
- ✅ Register and log in as a Candidate
- ✅ Upload PDF resume (max 5MB) with drag-and-drop support
- ✅ Browse all active job postings with search
- ✅ Apply to jobs with one click
- ✅ Get instant AI-powered analysis on every application
- ✅ View match score, missing keywords, strengths, and suggestions
- ✅ Side-by-side resume vs job description comparison with keyword highlighting
- ✅ Re-trigger analysis at any time

### Recruiter Side
- ✅ Register and log in as a Recruiter
- ✅ Create, edit, delete, and toggle job postings
- ✅ View all candidates ranked by AI match score
- ✅ Filter and search candidates
- ✅ Update application status (Pending → Shortlisted → Hired, etc.)
- ✅ View full analysis breakdown per candidate

### System
- ✅ JWT authentication with role-based authorization
- ✅ Auto-seeded admin, recruiter, and candidate accounts
- ✅ AI fallback to keyword matching if OpenAI is unavailable
- ✅ Clean architecture (Core / Application / Infrastructure / API)
- ✅ Scalar API documentation UI

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Backend | ASP.NET Core Web API (.NET 10) |
| ORM | Entity Framework Core 9 |
| Database | MS SQL Server (LocalDB for dev) |
| Auth | ASP.NET Identity + JWT Bearer |
| AI | OpenAI GPT-4o-mini |
| PDF Parsing | iText7 |
| API Docs | Scalar |
| Routing | React Router DOM v7 |

---

## 🏗 Architecture

```
ats-client (React + TypeScript)
        ↓ HTTP (Vite Proxy)
ATS.API (ASP.NET Core Web API)
        ↓
ATS.Application (Business Logic)
        ↓
ATS.Infrastructure (EF Core, Services, AI)
        ↓
ATS.Core (Models, DTOs, Interfaces, Enums)
        ↓
MS SQL Server (LocalDB)
```

### Clean Architecture Layers

| Project | Responsibility |
|---|---|
| `ATS.Core` | Domain models, DTOs, interfaces, enums — no dependencies |
| `ATS.Infrastructure` | EF Core DbContext, all service implementations, PDF parsing, AI calls |
| `ATS.Application` | Business logic orchestration |
| `ATS.API` | Controllers, middleware, DI registration, Program.cs |
| `ats-client` | React frontend — all UI, API calls, routing, state |

---

## 📁 Project Structure

```
ATS.System/
├── ATS.API/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ResumeController.cs
│   │   ├── JobController.cs
│   │   ├── ApplicationController.cs
│   │   ├── AnalysisController.cs
│   │   └── BaseController.cs
│   ├── Properties/
│   │   └── launchSettings.json
│   ├── wwwroot/
│   │   └── resumes/              ← Uploaded PDFs stored here
│   ├── appsettings.json
│   └── Program.cs
│
├── ATS.Application/
│
├── ATS.Core/
│   ├── DTOs/
│   │   ├── Auth/
│   │   ├── Resume/
│   │   ├── Job/
│   │   ├── Application/
│   │   └── Analysis/
│   ├── Enums/
│   │   ├── UserRole.cs
│   │   └── ApplicationStatus.cs
│   ├── Interfaces/
│   │   ├── IAuthService.cs
│   │   ├── IResumeService.cs
│   │   ├── IJobService.cs
│   │   ├── IApplicationService.cs
│   │   ├── IAnalysisService.cs
│   │   ├── IMatchingService.cs
│   │   └── ITokenService.cs
│   └── Models/
│       ├── User.cs
│       ├── Resume.cs
│       ├── Job.cs
│       ├── Application.cs
│       └── AnalysisResult.cs
│
├── ATS.Infrastructure/
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── AppDbContextFactory.cs
│   │   ├── DatabaseSeeder.cs
│   │   └── Migrations/
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── TokenService.cs
│   │   ├── ResumeService.cs
│   │   ├── JobService.cs
│   │   ├── ApplicationService.cs
│   │   ├── AnalysisService.cs
│   │   ├── MatchingService.cs
│   │   └── PdfParserService.cs
│   └── DependencyInjection.cs
│
└── ats-client/
    └── src/
        ├── api/
        │   ├── axios.ts
        │   ├── authApi.ts
        │   ├── resumeApi.ts
        │   ├── jobApi.ts
        │   ├── applicationApi.ts
        │   └── analysisApi.ts
        ├── components/
        │   ├── guards/
        │   │   └── ProtectedRoute.tsx
        │   ├── layout/
        │   │   ├── AppLayout.tsx
        │   │   ├── Navbar.tsx
        │   │   └── Sidebar.tsx
        │   └── ui/
        │       ├── Badge.tsx
        │       ├── EmptyState.tsx
        │       ├── ScoreRing.tsx
        │       └── Spinner.tsx
        ├── pages/
        │   ├── auth/
        │   │   ├── LoginPage.tsx
        │   │   └── RegisterPage.tsx
        │   ├── candidate/
        │   │   ├── DashboardPage.tsx
        │   │   ├── ResumeUploadPage.tsx
        │   │   ├── JobsPage.tsx
        │   │   └── AnalysisResultPage.tsx
        │   └── recruiter/
        │       ├── RecruiterDashboardPage.tsx
        │       ├── JobFormPage.tsx
        │       └── CandidatesPage.tsx
        ├── store/
        │   └── authStore.ts
        ├── types/
        │   └── index.ts
        ├── utils/
        │   └── cn.ts
        ├── App.tsx
        └── main.tsx
```

---

## ✅ Prerequisites

Before running this project, ensure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Visual Studio | 2022 (v17.8+) | https://visualstudio.microsoft.com |
| .NET SDK | 10.0+ | https://dotnet.microsoft.com/download |
| Node.js | 18.0+ | https://nodejs.org |
| SQL Server | LocalDB (included with VS) | Via VS Installer |
| Git | Latest | https://git-scm.com |

### Visual Studio Workloads Required
- ASP.NET and web development
- Data storage and processing

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ats-system.git
cd ats-system
```

### 2. Open in Visual Studio

Open `ATS.System.sln` in Visual Studio 2022.

### 3. Configure Backend Settings

Open `ATS.API/appsettings.json` and update:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ATSSystemDb;Trusted_Connection=True;"
  },
  "JwtSettings": {
    "Secret": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "ATS.API",
    "Audience": "ATS.Client",
    "ExpiryInDays": 7
  },
  "OpenAI": {
    "ApiKey": "YOUR_OPENAI_API_KEY_HERE",
    "Model": "gpt-4o-mini"
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://localhost:5173"
    ]
  }
}
```

> ⚠️ Replace `YOUR_OPENAI_API_KEY_HERE` with your actual key from https://platform.openai.com/api-keys. If omitted, the system falls back to keyword-based matching automatically.

### 4. Apply Database Migrations

In **Package Manager Console** (`Tools → NuGet Package Manager → Package Manager Console`):

```powershell
Update-Database -Project ATS.Infrastructure -StartupProject ATS.API
```

The database is created automatically and seeded with default accounts on first run.

### 5. Trust the Dev Certificate (First Time Only)

```bash
dotnet dev-certs https --trust
```

### 6. Run the Backend

In Visual Studio, press `F5` or click the green **Run** button. The backend will start and open Scalar at:

```
https://localhost:{port}/scalar
```

Note your HTTP port from the Output window — you will need it in the next step.

### 7. Install Frontend Dependencies

Open a terminal in the `ats-client` folder:

```bash
cd ats-client
npm install
```

### 8. Configure Frontend Environment

Create `ats-client/.env`:

```env
VITE_API_URL=/api
```

Update `ats-client/vite.config.ts` with your actual backend HTTP port:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",  // ← your backend HTTP port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### 9. Run the Frontend

```bash
npm run dev
```

Navigate to `http://localhost:5173` — the login page will appear.

---

## 🔐 Environment Variables

### Backend (`appsettings.json`)

| Key | Description | Required |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | MS SQL Server connection string | ✅ |
| `JwtSettings:Secret` | JWT signing secret (min 32 chars) | ✅ |
| `JwtSettings:Issuer` | JWT issuer name | ✅ |
| `JwtSettings:Audience` | JWT audience name | ✅ |
| `JwtSettings:ExpiryInDays` | Token expiry in days | ✅ |
| `OpenAI:ApiKey` | OpenAI API key | ⚠️ Optional (falls back to keyword matching) |
| `OpenAI:Model` | OpenAI model name | ⚠️ Optional |
| `FileStorage:ResumePath` | Path to store uploaded PDFs | ✅ |
| `Cors:AllowedOrigins` | Allowed frontend origins | ✅ |

### Frontend (`ats-client/.env`)

| Key | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend API base URL or proxy path | ✅ |

---

## 📡 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login and get JWT token |

### Resume

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/resume/upload` | Candidate | Upload PDF resume |
| GET | `/api/resume/my` | Candidate | Get my resumes |
| DELETE | `/api/resume/{id}` | Candidate | Delete a resume |

### Job

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/job` | None | Get all active jobs |
| GET | `/api/job/{id}` | None | Get job by ID |
| GET | `/api/job/my` | Recruiter | Get recruiter's jobs |
| POST | `/api/job` | Recruiter | Create a job |
| PUT | `/api/job/{id}` | Recruiter | Update a job |
| DELETE | `/api/job/{id}` | Recruiter | Delete a job |
| PATCH | `/api/job/{id}/toggle-status` | Recruiter | Toggle active status |

### Application

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/application` | Candidate | Apply to a job |
| GET | `/api/application/my` | Candidate | Get my applications |
| GET | `/api/application/job/{jobId}` | Recruiter | Get job applicants |
| PATCH | `/api/application/{id}/status` | Recruiter | Update status |

### Analysis

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analysis/{applicationId}` | Any | Get analysis result |
| POST | `/api/analysis/{applicationId}/analyze` | Any | Trigger re-analysis |

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| **Candidate** | Upload resumes, browse jobs, apply, view analysis |
| **Recruiter** | Post jobs, view candidates, manage statuses |
| **Admin** | Full access (future expansion) |

---

## 🔑 Default Seeded Accounts

These accounts are automatically created on first run:

| Role | Email | Password |
|---|---|---|
| Admin | admin@ats.com | Admin@1234 |
| Recruiter | recruiter@ats.com | Recruiter@1234 |
| Candidate | candidate@ats.com | Candidate@1234 |

> ⚠️ Change these credentials before deploying to production.

---

## 🗄 Database Schema

```
Users (ASP.NET Identity)
  ├── Id (string, PK)
  ├── FirstName
  ├── LastName
  ├── Email
  ├── Role
  └── CreatedAt

Resumes
  ├── Id (Guid, PK)
  ├── UserId (FK → Users)
  ├── FileName
  ├── FileUrl
  ├── ParsedText (nvarchar max)
  └── CreatedAt

Jobs
  ├── Id (Guid, PK)
  ├── RecruiterId (FK → Users)
  ├── Title
  ├── Description (nvarchar max)
  ├── Company
  ├── Location
  ├── IsActive
  ├── CreatedAt
  └── UpdatedAt

Applications
  ├── Id (Guid, PK)
  ├── ResumeId (FK → Resumes)
  ├── JobId (FK → Jobs)
  ├── CandidateId (FK → Users)
  ├── Status (enum)
  └── AppliedAt

AnalysisResults
  ├── Id (Guid, PK)
  ├── ApplicationId (FK → Applications, 1:1)
  ├── ResumeId
  ├── JobId
  ├── MatchScore (double)
  ├── MissingKeywordsJson (nvarchar max)
  ├── SuggestionsJson (nvarchar max)
  ├── StrengthsJson (nvarchar max)
  ├── AnalysisSource (AI | Keyword)
  └── CreatedAt
```

---

## 🧠 AI Analysis Engine

### How It Works

1. Candidate applies to a job
2. `ApplicationService` creates the application record
3. `AnalysisService.AnalyzeAsync()` is triggered automatically
4. The resume's parsed text + job description are sent to OpenAI GPT
5. GPT returns structured JSON with score, keywords, strengths, suggestions
6. Result is stored in `AnalysisResults` table
7. Candidate and recruiter can view the result instantly

### Prompt Structure

```
You are an expert ATS analyzer.
Compare the resume against the job description.

Return ONLY valid JSON:
{
  "score": <0-100>,
  "missing_keywords": ["keyword1", ...],
  "strengths": ["strength1", ...],
  "suggestions": ["suggestion1", ...]
}
```

### Fallback — Keyword Matching

If OpenAI is unavailable or the API key is not set, the system automatically falls back to an algorithmic keyword matching engine:

- Extracts meaningful keywords from both texts
- Filters out common stop words
- Calculates overlap percentage as the match score
- Returns missing keywords and generic suggestions

---

## 🔧 Troubleshooting

### Login returns 401 Unauthorized
- Ensure `AddIdentityCore` is used in `DependencyInjection.cs` (not `AddIdentity`)
- Confirm JWT middleware order in `Program.cs`: `UseAuthentication()` before `UseAuthorization()`

### Frontend shows blank white page
- Open browser DevTools (`F12`) → Console tab
- Look for `does not provide an export named` errors
- Ensure all imports from `types/index.ts` use `import type`
- Clear Vite cache: `rm -rf node_modules/.vite` then `npm run dev`

### ERR_CONNECTION_REFUSED
- Confirm the backend is running in Visual Studio
- Check `launchSettings.json` for the correct HTTP port
- Update `vite.config.ts` proxy target to match your port
- Run: `netstat -ano | findstr :5001` to verify the port is listening

### Migration errors
- Set `ATS.API` as Startup Project
- Set `ATS.Infrastructure` as Default Project in PMC
- Run: `Update-Database -Project ATS.Infrastructure -StartupProject ATS.API`

### PDF parsing returns empty text
- Ensure the PDF is not scanned/image-based (iText7 requires text-based PDFs)
- Check the `wwwroot/resumes/` folder exists in `ATS.API`
- Upload still succeeds — analysis falls back to keyword matching with empty text

### OpenAI API errors
- Verify your API key is correct in `appsettings.json`
- Check your OpenAI account has available credits
- The system automatically falls back to keyword matching on any OpenAI error

---

## 🗺 Roadmap

### Phase 2 — Planned Features
- [ ] Email notifications (application received, status changed)
- [ ] Resume versioning (multiple versions per candidate)
- [ ] Admin dashboard with platform-wide analytics
- [ ] Advanced candidate filtering (by skill, score threshold, location)
- [ ] Cover letter generator using AI
- [ ] Job recommendation engine for candidates

### Phase 3 — Infrastructure
- [ ] Docker + Docker Compose setup
- [ ] GitHub Actions CI/CD pipeline
- [ ] Deploy backend to Azure App Service
- [ ] Deploy frontend to Vercel
- [ ] Azure Blob Storage for resume files
- [ ] Redis caching for analysis results

---

## 📄 License

This project is licensed under the MIT License.

---

> Built with ASP.NET Core 10 · React 19 · OpenAI GPT · Entity Framework Core
