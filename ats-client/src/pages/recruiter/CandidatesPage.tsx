import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
    Users, Search, ChevronDown,
    ArrowUpDown, Mail, FileText,
} from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { applicationApi } from "../../api/applicationApi";
import type { Job, Application, ApplicationStatus } from "../../types/index";
import { StatusBadge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const STATUS_OPTIONS: ApplicationStatus[] = [
    "Pending", "UnderReview", "Shortlisted", "Rejected", "Hired",
];

export const CandidatesPage = () => {
    const [searchParams] = useSearchParams();
    const preselectedJobId = searchParams.get("jobId") ?? "";

    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJobId);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingApps, setLoadingApps] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"score" | "date">("score");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const myJobs = await jobApi.getMyJobs();
                setJobs(myJobs);
                if (!selectedJobId && myJobs.length > 0) {
                    setSelectedJobId(myJobs[0].id);
                }
            } catch {
                toast.error("Failed to load jobs.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!selectedJobId) return;
        const loadApps = async () => {
            setLoadingApps(true);
            try {
                const apps = await applicationApi.getJobApplications(selectedJobId);
                setApplications(apps);
            } catch {
                toast.error("Failed to load candidates.");
            } finally {
                setLoadingApps(false);
            }
        };
        loadApps();
    }, [selectedJobId]);

    const handleStatusChange = async (
        applicationId: string,
        status: ApplicationStatus
    ) => {
        setUpdatingId(applicationId);
        try {
            await applicationApi.updateStatus(applicationId, status);
            setApplications((prev) =>
                prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
            );
            toast.success("Status updated.");
        } catch {
            toast.error("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = applications
        .filter((a) =>
            a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
            a.candidateEmail.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "score") {
                return (b.matchScore ?? 0) - (a.matchScore ?? 0);
            }
            return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        });

    const selectedJob = jobs.find((j) => j.id === selectedJobId);

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
                <h1 className="text-2xl font-bold text-surface-900">Candidates</h1>
                <p className="text-surface-400 mt-1">
                    Review and rank applicants by AI match score.
                </p>
            </div>

            {/* Job Selector */}
            {jobs.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No jobs posted yet"
                    description="Post a job to start receiving applications."
                    action={
                        <Link
                            to="/recruiter/jobs/new"
                            className="btn-primary text-sm"
                            style={{ width: "auto" }}
                        >
                            Post a Job
                        </Link>
                    }
                />
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Job Selector */}
                        <div className="relative sm:w-72">
                            <select
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                className="input-field appearance-none pr-8"
                            >
                                {jobs.map((j) => (
                                    <option key={j.id} value={j.id}>
                                        {j.title} — {j.company}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
                        </div>

                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-9"
                            />
                        </div>

                        {/* Sort */}
                        <button
                            onClick={() =>
                                setSortBy((s) => (s === "score" ? "date" : "score"))
                            }
                            className="btn-secondary flex items-center gap-2 text-sm"
                            style={{ width: "auto" }}
                        >
                            <ArrowUpDown className="h-4 w-4" />
                            Sort by {sortBy === "score" ? "Date" : "Score"}
                        </button>
                    </div>

                    {/* Candidate Summary */}
                    {selectedJob && (
                        <div
                            className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-3"
                            style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
                        >
                            <div>
                                <p className="font-semibold text-surface-900">
                                    {selectedJob.title}
                                </p>
                                <p className="text-sm text-surface-500">
                                    {selectedJob.company} · {selectedJob.location}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="font-medium text-surface-700">
                                    {applications.length} total applicants
                                </span>
                                <span style={{ color: "#059669" }} className="font-medium">
                                    {applications.filter((a) => (a.matchScore ?? 0) >= 70).length}{" "}
                                    strong matches
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Candidates Table */}
                    {loadingApps ? (
                        <div className="flex items-center justify-center h-40">
                            <Spinner size="lg" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="No candidates yet"
                            description="Candidates will appear here once they apply to this job."
                        />
                    ) : (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-surface-100 bg-surface-50">
                                            <th className="text-left p-4 font-medium text-surface-500">
                                                Candidate
                                            </th>
                                            <th className="text-center p-4 font-medium text-surface-500">
                                                Match Score
                                            </th>
                                            <th className="text-center p-4 font-medium text-surface-500">
                                                Status
                                            </th>
                                            <th className="text-left p-4 font-medium text-surface-500">
                                                Applied
                                            </th>
                                            <th className="text-right p-4 font-medium text-surface-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-50">
                                        {filtered.map((app, index) => (
                                            <tr
                                                key={app.id}
                                                className="hover:bg-surface-50 transition-colors"
                                            >
                                                {/* Rank + Name */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                            style={{
                                                                backgroundColor:
                                                                    index === 0
                                                                        ? "#fef9c3"
                                                                        : index === 1
                                                                            ? "#f1f5f9"
                                                                            : index === 2
                                                                                ? "#fef3c7"
                                                                                : "#f8fafc",
                                                                color:
                                                                    index === 0
                                                                        ? "#854d0e"
                                                                        : index === 1
                                                                            ? "#475569"
                                                                            : index === 2
                                                                                ? "#92400e"
                                                                                : "#94a3b8",
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-surface-900">
                                                                {app.candidateName}
                                                            </p>
                                                            <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                                                                <Mail className="h-3 w-3" />
                                                                {app.candidateEmail}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Score */}
                                                <td className="p-4 text-center">
                                                    {app.matchScore !== null ? (
                                                        <div className="flex flex-col items-center">
                                                            <span
                                                                className="text-lg font-bold"
                                                                style={{
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
                                                            {/* Mini bar */}
                                                            <div
                                                                className="w-16 h-1.5 rounded-full mt-1"
                                                                style={{ backgroundColor: "#e2e8f0" }}
                                                            >
                                                                <div
                                                                    className="h-1.5 rounded-full"
                                                                    style={{
                                                                        width: `${app.matchScore}%`,
                                                                        backgroundColor:
                                                                            app.matchScore >= 70
                                                                                ? "#059669"
                                                                                : app.matchScore >= 50
                                                                                    ? "#d97706"
                                                                                    : "#dc2626",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-surface-300 text-xs">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status Dropdown */}
                                                <td className="p-4 text-center">
                                                    {updatingId === app.id ? (
                                                        <Spinner size="sm" />
                                                    ) : (
                                                        <div className="relative inline-block">
                                                            <select
                                                                value={app.status}
                                                                onChange={(e) =>
                                                                    handleStatusChange(
                                                                        app.id,
                                                                        e.target.value as ApplicationStatus
                                                                    )
                                                                }
                                                                className="text-xs pl-2 pr-6 py-1.5 rounded-full border font-medium appearance-none cursor-pointer"
                                                                style={{
                                                                    backgroundColor:
                                                                        app.status === "Shortlisted"
                                                                            ? "#ecfdf5"
                                                                            : app.status === "Hired"
                                                                                ? "#f5f3ff"
                                                                                : app.status === "Rejected"
                                                                                    ? "#fef2f2"
                                                                                    : app.status === "UnderReview"
                                                                                        ? "#eff6ff"
                                                                                        : "#fffbeb",
                                                                    color:
                                                                        app.status === "Shortlisted"
                                                                            ? "#059669"
                                                                            : app.status === "Hired"
                                                                                ? "#7c3aed"
                                                                                : app.status === "Rejected"
                                                                                    ? "#dc2626"
                                                                                    : app.status === "UnderReview"
                                                                                        ? "#2563eb"
                                                                                        : "#d97706",
                                                                    borderColor: "transparent",
                                                                }}
                                                            >
                                                                {STATUS_OPTIONS.map((s) => (
                                                                    <option key={s} value={s}>
                                                                        {s}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Applied Date */}
                                                <td className="p-4 text-surface-500">
                                                    {new Date(app.appliedAt).toLocaleDateString("en-ZA", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/analysis/${app.id}`}
                                                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                            style={{
                                                                backgroundColor: "#eff6ff",
                                                                color: "#2563eb",
                                                            }}
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            Analysis
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};