import { useEffect, useState } from "react";
import { Briefcase, MapPin, Building2, Users, Search } from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { resumeApi } from "../../api/resumeApi";
import { applicationApi } from "../../api/applicationApi";
import type { Job, Resume } from "../../types/index";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

export const JobsPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [applying, setApplying] = useState<string | null>(null);
    const [selectedResume, setSelectedResume] = useState<string>("");
    const [applyingTo, setApplyingTo] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [j, r] = await Promise.all([
                    jobApi.getAllJobs(),
                    resumeApi.getMyResumes(),
                ]);
                setJobs(j);
                setResumes(r);
                if (r.length > 0) setSelectedResume(r[0].id);
            } catch {
                toast.error("Failed to load jobs.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = jobs.filter(
        (j) =>
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.company.toLowerCase().includes(search.toLowerCase()) ||
            j.location.toLowerCase().includes(search.toLowerCase())
    );

    const handleApply = async (jobId: string) => {
        if (!selectedResume) {
            toast.error("Please upload a resume first.");
            return;
        }
        setApplying(jobId);
        try {
            await applicationApi.apply({ resumeId: selectedResume, jobId });
            toast.success("Application submitted! AI analysis is running...");
            setApplyingTo(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to apply.");
        } finally {
            setApplying(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Browse Jobs</h1>
                <p className="text-surface-400 mt-1">
                    Find your next opportunity and get an instant AI match score.
                </p>
            </div>

            {/* Search + Resume Selector */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search jobs, companies, locations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-9"
                    />
                </div>
                {resumes.length > 0 && (
                    <select
                        value={selectedResume}
                        onChange={(e) => setSelectedResume(e.target.value)}
                        className="input-field sm:w-64"
                    >
                        {resumes.map((r) => (
                            <option key={r.id} value={r.id}>{r.fileName}</option>
                        ))}
                    </select>
                )}
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="No jobs found"
                    description="Try adjusting your search terms."
                />
            ) : (
                <div className="grid gap-4">
                    {filtered.map((job) => (
                        <div key={job.id} className="card p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-surface-900 text-lg">
                                            {job.title}
                                        </h3>
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
                                        >
                                            Active
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-surface-400 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Building2 className="h-3.5 w-3.5" />
                                            {job.company}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" />
                                            {job.applicationCount} applicants
                                        </span>
                                    </div>

                                    <p className="text-sm text-surface-600 line-clamp-2">
                                        {job.description}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    {applyingTo === job.id ? (
                                        <div
                                            className="p-3 rounded-lg border text-sm"
                                            style={{ borderColor: "#e2e8f0", minWidth: "200px" }}
                                        >
                                            <p className="text-surface-600 font-medium mb-2">
                                                Apply with:
                                            </p>
                                            {resumes.length === 0 ? (
                                                <p className="text-red-500 text-xs">
                                                    No resumes uploaded yet.
                                                </p>
                                            ) : (
                                                <>
                                                    <select
                                                        value={selectedResume}
                                                        onChange={(e) => setSelectedResume(e.target.value)}
                                                        className="input-field text-xs mb-2"
                                                    >
                                                        {resumes.map((r) => (
                                                            <option key={r.id} value={r.id}>
                                                                {r.fileName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApply(job.id)}
                                                            disabled={applying === job.id}
                                                            className="btn-primary text-xs py-1.5 flex-1"
                                                        >
                                                            {applying === job.id ? (
                                                                <Spinner size="sm" />
                                                            ) : (
                                                                "Confirm"
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => setApplyingTo(null)}
                                                            className="btn-secondary text-xs py-1.5"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setApplyingTo(job.id)}
                                            className="btn-primary text-sm py-2 px-5"
                                            style={{ width: "120px" }}
                                        >
                                            Apply Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};