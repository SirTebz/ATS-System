import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Briefcase, BarChart2, TrendingUp } from "lucide-react";
import { applicationApi } from "../../api/applicationApi";
import { resumeApi } from "../../api/resumeApi";
import { jobApi } from "../../api/jobApi";
import type { Application, Resume, Job } from "../../types/index";
import { StatusBadge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useAuthStore } from "../../store/authStore";

export const DashboardPage = () => {
    const { user } = useAuthStore();
    const [applications, setApplications] = useState<Application[]>([]);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [apps, res, j] = await Promise.all([
                    applicationApi.getMyApplications(),
                    resumeApi.getMyResumes(),
                    jobApi.getAllJobs(),
                ]);
                setApplications(apps);
                setResumes(res);
                setJobs(j);
            } catch {
                // silently fail — empty state handles it
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const avgScore =
        applications.length > 0
            ? Math.round(
                applications
                    .filter((a) => a.matchScore !== null)
                    .reduce((sum, a) => sum + (a.matchScore ?? 0), 0) /
                applications.filter((a) => a.matchScore !== null).length
            )
            : 0;

    const stats = [
        {
            label: "My Resumes",
            value: resumes.length,
            icon: FileText,
            color: "#2563eb",
            bg: "#eff6ff",
            to: "/resumes",
        },
        {
            label: "Applications",
            value: applications.length,
            icon: BarChart2,
            color: "#7c3aed",
            bg: "#f5f3ff",
            to: "/applications",
        },
        {
            label: "Open Jobs",
            value: jobs.length,
            icon: Briefcase,
            color: "#059669",
            bg: "#ecfdf5",
            to: "/jobs",
        },
        {
            label: "Avg Match Score",
            value: `${avgScore}%`,
            icon: TrendingUp,
            color: "#d97706",
            bg: "#fffbeb",
            to: "/applications",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-900">
                    Welcome back, {user?.fullName?.split(" ")[0]} 👋
                </h1>
                <p className="text-surface-400 mt-1">
                    Here's what's happening with your job search.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg, to }) => (
                    <Link key={label} to={to} className="card p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: bg }}
                            >
                                <Icon className="h-5 w-5" style={{ color }} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-surface-900">{value}</p>
                        <p className="text-sm text-surface-400 mt-0.5">{label}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Applications */}
            <div className="card">
                <div className="p-5 border-b border-surface-200 flex items-center justify-between">
                    <h2 className="font-semibold text-surface-900">Recent Applications</h2>
                    <Link to="/applications" className="text-sm font-medium" style={{ color: "#2563eb" }}>
                        View all
                    </Link>
                </div>
                {applications.length === 0 ? (
                    <div className="p-10 text-center text-surface-400">
                        <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No applications yet</p>
                        <p className="text-sm mt-1">
                            <Link to="/jobs" style={{ color: "#2563eb" }}>
                                Browse jobs
                            </Link>{" "}
                            to get started
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-surface-100">
                        {applications.slice(0, 5).map((app) => (
                            <div key={app.id} className="p-4 flex items-center justify-between hover:bg-surface-50">
                                <div>
                                    <p className="font-medium text-surface-900">{app.jobTitle}</p>
                                    <p className="text-sm text-surface-400">{app.company}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {app.matchScore !== null && (
                                        <span
                                            className="text-sm font-semibold px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    app.matchScore >= 70 ? "#ecfdf5" : app.matchScore >= 50 ? "#fffbeb" : "#fef2f2",
                                                color:
                                                    app.matchScore >= 70 ? "#059669" : app.matchScore >= 50 ? "#d97706" : "#dc2626",
                                            }}
                                        >
                                            {Math.round(app.matchScore)}%
                                        </span>
                                    )}
                                    <StatusBadge status={app.status} />
                                    <Link
                                        to={`/analysis/${app.id}`}
                                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                        style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                                    >
                                        View Analysis
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};