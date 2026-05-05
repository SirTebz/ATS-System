// ── Auth ──────────────────────────────────────────────────────────────────
export interface AuthResponse {
    token: string;
    email: string;
    fullName: string;
    role: string;
    expiresAt: string;
}

export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "Candidate" | "Recruiter";
}

export interface LoginDto {
    email: string;
    password: string;
}

// ── Resume ─────────────────────────────────────────────────────────────────
export interface Resume {
    id: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
    hasParsedText: boolean;
}

// ── Job ────────────────────────────────────────────────────────────────────
export interface Job {
    id: string;
    title: string;
    description: string;
    company: string;
    location: string;
    isActive: boolean;
    recruiterName: string;
    createdAt: string;
    applicationCount: number;
}

export interface CreateJobDto {
    title: string;
    description: string;
    company: string;
    location: string;
}

export interface UpdateJobDto {
    title?: string;
    description?: string;
    company?: string;
    location?: string;
    isActive?: boolean;
}

// ── Application ────────────────────────────────────────────────────────────
export type ApplicationStatus =
    | "Pending"
    | "UnderReview"
    | "Shortlisted"
    | "Rejected"
    | "Hired";

export interface Application {
    id: string;
    resumeId: string;
    jobId: string;
    jobTitle: string;
    company: string;
    candidateName: string;
    candidateEmail: string;
    status: ApplicationStatus;
    appliedAt: string;
    matchScore: number | null;
}

export interface CreateApplicationDto {
    resumeId: string;
    jobId: string;
}

// ── Analysis ───────────────────────────────────────────────────────────────
export interface AnalysisResult {
    id: string;
    applicationId: string;
    matchScore: number;
    missingKeywords: string[];
    strengths: string[];
    suggestions: string[];
    analysisSource: string;
    createdAt: string;
}

// ── API Error ──────────────────────────────────────────────────────────────
export interface ApiError {
    message: string;
}