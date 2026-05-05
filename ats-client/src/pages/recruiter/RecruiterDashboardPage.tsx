import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Briefcase, Users, TrendingUp,
    PlusCircle, Eye, ToggleLeft, Trash2,
} from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { applicationApi } from "../../api/applicationApi";
import type { Job, Application } from "../../types/index";
import { StatusBadge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

export const RecruiterDashboardPage = () => {
    const { user } = useAuthStore();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [recentApplications, setRecentApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const myJobs = await jobApi.getMyJobs();
            setJobs(myJobs);

            // Load applications for all jobs
            const appPromises = myJobs.slice(0, 3).map((j) =>
                applicationApi.getJobApplications(j.id).catch(() => [])
            );
            const appArrays = await Promise.all(appPromises);
            const all = appArrays
                .flat()
                .sort(
                    (a, b) =>
                        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
                );
            setRecentApplications(all.slice(0, 6));
        } catch {
            toast.error("Failed to load dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleToggle = async (jobId: string) => {
        try {
            const updated = await jobApi.toggleStatus(jobId);
            setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
            toast.success(`Job ${updated.isActive ? "activated" : "deactivated"}.`);
        } catch {
            toast.error("Failed to update job status.");
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!confirm("Are you sure you want to delete this job?")) return;
        try {
            await jobApi.deleteJob(jobId);
            setJobs((prev) => prev.filter((j) => j.id !== jobId));
            toast.success("Job deleted.");
        } catch {
            toast.error("Failed to delete job.");
        }
    };

    const totalApplications = recentApplications.length;
    const activeJobs = jobs.filter((j) => j.isActive).length;
    const avgScore =
        recentApplications.filter((a) => a.matchScore !== null).length > 0
            ? Math.round(
                recentApplications
                    .filter((a) => a.matchScore !== null)
                    .reduce((sum, a) => sum + (a.matchScore ?? 0), 0) /
                recentApplications.filter((a) => a.matchScore !== null).length
            )
            : 0;

    const stats = [
        {
            label: "Total Jobs",
            value: jobs.length,
            icon: Briefcase,
            color: "#2563eb",
            bg: "#eff6ff",
        },
        {
            label: "Active Jobs",
            value: activeJobs,
            icon: TrendingUp,
            color: "#059669",
            bg: "#ecfdf5",
        },
        {
            label: "Recent Applicants",
            value: totalApplications,
            icon: Users,
            color: "#7c3aed",
            bg: "#f5f3ff",
        },
        {
            label: "Avg Match Score",
            value: `${avgScore}%`,
            icon: TrendingUp,
            color: "#d97706",
            bg: "#fffbeb",
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
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">
                        Welcome, {user?.fullName?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-surface-400 mt-1">
                        Manage your job postings and review candidates.
                    </p>
                </div>
                <Link
                    to="/recruiter/jobs/new"
                    className="btn-primary flex items-center gap-2 text-sm"
                    style={{ width: "auto" }}
                >
                    <PlusCircle className="h-4 w-4" />
                    Post a Job
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="card p-5">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                            style={{ backgroundColor: bg }}
                        >
                            <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <p className="text-2xl font-bold text-surface-900">{value}</p>
                        <p className="text-sm text-surface-400 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Jobs Table */}
            <div className="card">
                <div className="p-5 border-b border-surface-200 flex items-center justify-between">
                    <h2 className="font-semibold text-surface-900">My Job Postings</h2>
                    <Link
                        to="/recruiter/jobs/new"
                        className="text-sm font-medium"
                        style={{ color: "#2563eb" }}
                    >
                        + New Job
                    </Link>
                </div>

                {jobs.length === 0 ? (
                    <div className="p-10 text-center">
                        <Briefcase className="h-10 w-10 mx-auto mb-3 text-surface-300" />
                        <p className="font-medium text-surface-700">No jobs posted yet</p>
                        <Link
                            to="/recruiter/jobs/new"
                            className="btn-primary mt-4 inline-flex text-sm"
                            style={{ width: "auto" }}
                        >
                            Post your first job
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-surface-100">
                                    <th className="text-left p-4 font-medium text-surface-500">
                                        Job Title
                                    </th>
                                    <th className="text-left p-4 font-medium text-surface-500">
                                        Company
                                    </th>
                                    <th className="text-left p-4 font-medium text-surface-500">
                                        Location
                                    </th>
                                    <th className="text-center p-4 font-medium text-surface-500">
                                        Applicants
                                    </th>
                                    <th className="text-center p-4 font-medium text-surface-500">
                                        Status
                                    </th>
                                    <th className="text-right p-4 font-medium text-surface-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-50">
                                {jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-surface-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-medium text-surface-900">{job.title}</p>
                                            <p className="text-xs text-surface-400 mt-0.5">
                                                {new Date(job.createdAt).toLocaleDateString("en-ZA", {
                                                    year: "numeric", month: "short", day: "numeric",
                                                })}
                                            </p>
                                        </td>
                                        <td className="p-4 text-surface-600">{job.company}</td>
                                        <td className="p-4 text-surface-600">{job.location}</td>
                                        <td className="p-4 text-center">
                                            <Link
                                                to={`/recruiter/candidates?jobId=${job.id}`}
                                                className="inline-flex items-center gap-1 font-medium hover:underline"
                                                style={{ color: "#2563eb" }}
                                            >
                                                <Users className="h-3.5 w-3.5" />
                                                {job.applicationCount}
                                            </Link>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor: job.isActive ? "#ecfdf5" : "#f1f5f9",
                                                    color: job.isActive ? "#059669" : "#64748b",
                                                }}
                                            >
                                                {job.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/recruiter/candidates?jobId=${job.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
                                                    title="View candidates"
                                                >
                                                    <Eye className="h-4 w-4 text-surface-500" />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggle(job.id)}
                                                    className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
                                                    title={job.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    <ToggleLeft
                                                        className="h-4 w-4"
                                                        style={{ color: job.isActive ? "#059669" : "#94a3b8" }}
                                                    />
                                                </button>
                                                <Link
                                                    to={`/recruiter/jobs/${job.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
                                                    title="Edit job"
                                                >
                                                    <PlusCircle className="h-4 w-4 text-surface-500" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Delete job"
                                                >
                                                    <Trash2 className="h-4 w-4" style={{ color: "#dc2626" }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Applications */}
            {recentApplications.length > 0 && (
                <div className="card">
                    <div className="p-5 border-b border-surface-200">
                        <h2 className="font-semibold text-surface-900">
                            Recent Applications
                        </h2>
                    </div>
                    <div className="divide-y divide-surface-50">
                        {recentApplications.map((app) => (
                            <div
                                key={app.id}
                                className="p-4 flex items-center justify-between hover:bg-surface-50"
                            >
                                <div>
                                    <p className="font-medium text-surface-900">
                                        {app.candidateName}
                                    </p>
                                    <p className="text-xs text-surface-400 mt-0.5">
                                        {app.jobTitle} ·{" "}
                                        {new Date(app.appliedAt).toLocaleDateString("en-ZA")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {app.matchScore !== null && (
                                        <span
                                            className="text-sm font-semibold px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    app.matchScore >= 70
                                                        ? "#ecfdf5"
                                                        : app.matchScore >= 50
                                                            ? "#fffbeb"
                                                            : "#fef2f2",
                                                color:
                                                    app.matchScore >= 70
                                                        ? "#059669"
                                                        : app.matchScore >= 50
                                                            ? "#d97706"
                                                            : "#dc2626",
                                            }}
                                        >
                                            {Math.round(app.matchScore)}%
                                        </span>
                                    )}
                                    <StatusBadge status={app.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};