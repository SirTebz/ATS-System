import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute } from "./components/guards/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/candidate/DashboardPage";
import { ResumeUploadPage } from "./pages/candidate/ResumeUploadPage";
import { JobsPage } from "./pages/candidate/JobsPage";
import { AnalysisResultPage } from "./pages/candidate/AnalysisResultPage";
import { RecruiterDashboardPage } from "./pages/recruiter/RecruiterDashboardPage";
import { JobFormPage } from "./pages/recruiter/JobFormPage";
import { CandidatesPage } from "./pages/recruiter/CandidatesPage";

export default function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: { fontSize: "14px" },
                }}
            />
            <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Candidate routes */}
                <Route element={<ProtectedRoute allowedRole="Candidate" />}>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/resumes" element={<ResumeUploadPage />} />
                        <Route path="/jobs" element={<JobsPage />} />
                        <Route path="/applications" element={<JobsPage />} />
                        <Route path="/analysis/:applicationId" element={<AnalysisResultPage />} />
                    </Route>
                </Route>

                {/* Recruiter routes */}
                <Route element={<ProtectedRoute allowedRole="Recruiter" />}>
                    <Route element={<AppLayout />}>
                        <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
                        <Route path="/recruiter/jobs" element={<JobFormPage />} />
                        <Route path="/recruiter/jobs/new" element={<JobFormPage />} />
                        <Route path="/recruiter/jobs/:id" element={<JobFormPage />} />
                        <Route path="/recruiter/candidates" element={<CandidatesPage />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route
                    path="/unauthorized"
                    element={
                        <div className="min-h-screen flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-surface-900 mb-2">403</h1>
                                <p className="text-surface-400">
                                    You don't have permission to view this page.
                                </p>
                            </div>
                        </div>
                    }
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}