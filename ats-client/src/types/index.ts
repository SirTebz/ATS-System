export type AuthResponse = {
    token: string;
    email: string;
    fullName: string;
    role: string;
    expiresAt: string;
};

export type RegisterDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "Candidate" | "Recruiter";
};

export type LoginDto = {
    email: string;
    password: string;
};

export type Resume = {
    id: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
    hasParsedText: boolean;
};

export type Job = {
    id: string;
    title: string;
    description: string;
    company: string;
    location: string;
    isActive: boolean;
    recruiterName: string;
    createdAt: string;
    applicationCount: number;
};

export type CreateJobDto = {
    title: string;
    description: string;
    company: string;
    location: string;
};

export type UpdateJobDto = {
    title?: string;
    description?: string;
    company?: string;
    location?: string;
    isActive?: boolean;
};

export type ApplicationStatus =
    | "Pending"
    | "UnderReview"
    | "Shortlisted"
    | "Rejected"
    | "Hired";

export type Application = {
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
};

export type CreateApplicationDto = {
    resumeId: string;
    jobId: string;
};

export type AnalysisResult = {
    id: string;
    applicationId: string;
    matchScore: number;
    missingKeywords: string[];
    strengths: string[];
    suggestions: string[];
    analysisSource: string;
    createdAt: string;
};

export type ApiError = {
    message: string;
};