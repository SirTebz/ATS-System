import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, RefreshCw, Lightbulb,
    ShieldCheck, AlertTriangle, Info,
} from "lucide-react";
import { analysisApi } from "../../api/analysisApi";
import { applicationApi } from "../../api/applicationApi";
import { jobApi } from "../../api/jobApi";
import { resumeApi } from "../../api/resumeApi";
import type { AnalysisResult, Application, Job, Resume } from "../../types/index";
import { ScoreRing } from "../../components/ui/ScoreRing";
import { StatusBadge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const HighlightedText = ({
    text,
    keywords,
    color,
}: {
    text: string;
    keywords: string[];
    color: "green" | "red";
}) => {
    if (!keywords.length) return <p className="text-sm text-surface-600 whitespace-pre-wrap">{text}</p>;

    const escaped = keywords.map((k) =>
        k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const regex = new RegExp(`(${escaped.join("|")})`, "gi");
    const parts = text.split(regex);

    return (
        <p className="text-sm text-surface-600 whitespace-pre-wrap leading-relaxed">
            {parts.map((part, i) => {
                const isMatch = keywords.some(
                    (k) => k.toLowerCase() === part.toLowerCase()
                );
                if (isMatch) {
                    return (
                        <mark
                            key={i}
                            className="px-0.5 rounded font-medium"
                            style={{
                                backgroundColor: color === "green" ? "#bbf7d0" : "#fecaca",
                                color: color === "green" ? "#166534" : "#991b1b",
                            }}
                        >
                            {part}
                        </mark>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </p>
    );
};

export const AnalysisResultPage = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [job, setJob] = useState<Job | null>(null);
    const [resume, setResume] = useState<Resume | null>(null);
    const [resumeText, setResumeText] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [reanalyzing, setReanalyzing] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>("suggestions");

    const load = async () => {
        if (!applicationId) return;
        try {
            const [apps, res] = await Promise.all([
                applicationApi.getMyApplications(),
                analysisApi.getResult(applicationId),
            ]);

            const app = apps.find((a) => a.id === applicationId);
            setApplication(app ?? null);
            setResult(res);

            if (app) {
                const [j, r] = await Promise.all([
                    jobApi.getJobById(app.jobId),
                    resumeApi.getMyResumes(),
                ]);
                setJob(j);
                const matchedResume = r.find((rv) => rv.id === app.resumeId);
                setResume(matchedResume ?? null);
            }
        } catch {
            toast.error("Failed to load analysis.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [applicationId]);

    const handleReanalyze = async () => {
        if (!applicationId) return;
        setReanalyzing(true);
        try {
            const updated = await analysisApi.reanalyze(applicationId);
            setResult(updated);
            toast.success("Re-analysis complete!");
        } catch {
            toast.error("Re-analysis failed.");
        } finally {
            setReanalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!result) {
        return (
            <div className="text-center py-16">
                <Info className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-surface-700">No analysis found</h2>
                <p className="text-surface-400 mt-1">
                    This application hasn't been analyzed yet.
                </p>
                <Link to="/applications" className="btn-primary mt-4 inline-flex">
                    Back to Applications
                </Link>
            </div>
        );
    }

    const scoreLabel =
        result.matchScore >= 70
            ? "Strong Match"
            : result.matchScore >= 50
                ? "Moderate Match"
                : "Weak Match";

    const scoreColor =
        result.matchScore >= 70
            ? "#059669"
            : result.matchScore >= 50
                ? "#d97706"
                : "#dc2626";

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Link
                        to="/dashboard"
                        className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-surface-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-surface-900">
                            {application?.jobTitle ?? "Analysis Result"}
                        </h1>
                        <p className="text-sm text-surface-400">
                            {application?.company} ·{" "}
                            {application && (
                                <StatusBadge status={application.status} />
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
                    >
                        Source: {result.analysisSource}
                    </span>
                    <button
                        onClick={handleReanalyze}
                        disabled={reanalyzing}
                        className="btn-secondary flex items-center gap-2 text-sm py-2"
                    >
                        {reanalyzing ? (
                            <Spinner size="sm" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Re-analyze
                    </button>
                </div>
            </div>

            {/* Score Banner */}
            <div
                className="card p-6 flex flex-col sm:flex-row items-center gap-6"
                style={{ borderLeft: `4px solid ${scoreColor}` }}
            >
                <ScoreRing score={result.matchScore} size={130} />
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold" style={{ color: scoreColor }}>
                        {scoreLabel}
                    </h2>
                    <p className="text-surface-500 mt-1">
                        Your resume matches{" "}
                        <span className="font-semibold" style={{ color: scoreColor }}>
                            {Math.round(result.matchScore)}%
                        </span>{" "}
                        of this job's requirements.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: "#059669" }}
                            />
                            <span className="text-surface-600">
                                {result.strengths.length} Strengths
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: "#dc2626" }}
                            />
                            <span className="text-surface-600">
                                {result.missingKeywords.length} Missing Keywords
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: "#2563eb" }}
                            />
                            <span className="text-surface-600">
                                {result.suggestions.length} Suggestions
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Resume */}
                <div className="card">
                    <div
                        className="p-4 border-b font-semibold text-surface-900 flex items-center gap-2"
                        style={{ borderColor: "#e2e8f0" }}
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#059669" }}
                        />
                        Resume
                        {resume && (
                            <span className="text-xs text-surface-400 font-normal ml-1">
                                — {resume.fileName}
                            </span>
                        )}
                    </div>
                    <div className="p-4 max-h-72 overflow-y-auto">
                        <HighlightedText
                            text={
                                resumeText ||
                                "Resume text preview not available. The resume has been parsed and stored."
                            }
                            keywords={result.strengths}
                            color="green"
                        />
                    </div>
                </div>

                {/* Job Description */}
                <div className="card">
                    <div
                        className="p-4 border-b font-semibold text-surface-900 flex items-center gap-2"
                        style={{ borderColor: "#e2e8f0" }}
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#dc2626" }}
                        />
                        Job Description
                        {job && (
                            <span className="text-xs text-surface-400 font-normal ml-1">
                                — {job.title}
                            </span>
                        )}
                    </div>
                    <div className="p-4 max-h-72 overflow-y-auto">
                        <HighlightedText
                            text={job?.description ?? "Loading job description..."}
                            keywords={result.missingKeywords}
                            color="red"
                        />
                    </div>
                </div>
            </div>

            {/* Missing Keywords */}
            {result.missingKeywords.length > 0 && (
                <div className="card p-5">
                    <button
                        onClick={() =>
                            setExpandedSection(
                                expandedSection === "missing" ? null : "missing"
                            )
                        }
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "#fef2f2" }}
                            >
                                <AlertTriangle className="h-4 w-4" style={{ color: "#dc2626" }} />
                            </div>
                            <span className="font-semibold text-surface-900">
                                Missing Keywords
                            </span>
                            <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                            >
                                {result.missingKeywords.length}
                            </span>
                        </div>
                        <span className="text-surface-400 text-lg">
                            {expandedSection === "missing" ? "−" : "+"}
                        </span>
                    </button>

                    {expandedSection === "missing" && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {result.missingKeywords.map((keyword) => (
                                <span
                                    key={keyword}
                                    className="px-3 py-1.5 rounded-full text-sm font-medium border"
                                    style={{
                                        backgroundColor: "#fef2f2",
                                        color: "#991b1b",
                                        borderColor: "#fecaca",
                                    }}
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Strengths */}
            {result.strengths.length > 0 && (
                <div className="card p-5">
                    <button
                        onClick={() =>
                            setExpandedSection(
                                expandedSection === "strengths" ? null : "strengths"
                            )
                        }
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "#ecfdf5" }}
                            >
                                <ShieldCheck className="h-4 w-4" style={{ color: "#059669" }} />
                            </div>
                            <span className="font-semibold text-surface-900">Strengths</span>
                            <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
                            >
                                {result.strengths.length}
                            </span>
                        </div>
                        <span className="text-surface-400 text-lg">
                            {expandedSection === "strengths" ? "−" : "+"}
                        </span>
                    </button>

                    {expandedSection === "strengths" && (
                        <ul className="mt-4 space-y-2">
                            {result.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-surface-700">
                                    <span
                                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: "#059669" }}
                                    />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
                <div className="card p-5">
                    <button
                        onClick={() =>
                            setExpandedSection(
                                expandedSection === "suggestions" ? null : "suggestions"
                            )
                        }
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "#eff6ff" }}
                            >
                                <Lightbulb className="h-4 w-4" style={{ color: "#2563eb" }} />
                            </div>
                            <span className="font-semibold text-surface-900">
                                Suggestions
                            </span>
                            <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                            >
                                {result.suggestions.length}
                            </span>
                        </div>
                        <span className="text-surface-400 text-lg">
                            {expandedSection === "suggestions" ? "−" : "+"}
                        </span>
                    </button>

                    {expandedSection === "suggestions" && (
                        <ul className="mt-4 space-y-3">
                            {result.suggestions.map((s, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3 p-3 rounded-lg text-sm"
                                    style={{ backgroundColor: "#eff6ff" }}
                                >
                                    <span
                                        className="font-bold flex-shrink-0"
                                        style={{ color: "#2563eb" }}
                                    >
                                        {i + 1}.
                                    </span>
                                    <span className="text-surface-700">{s}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};