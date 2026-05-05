import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Trash2, CheckCircle } from "lucide-react";
import { resumeApi } from "../../api/resumeApi";
import type { Resume } from "../../types/index";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

export const ResumeUploadPage = () => {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const loadResumes = async () => {
        try {
            const data = await resumeApi.getMyResumes();
            setResumes(data);
        } catch {
            toast.error("Failed to load resumes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadResumes(); }, []);

    const handleUpload = async (file: File) => {
        if (!file.name.endsWith(".pdf")) {
            toast.error("Only PDF files are accepted.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File must be under 5MB.");
            return;
        }
        setUploading(true);
        try {
            const uploaded = await resumeApi.upload(file);
            setResumes((prev) => [uploaded, ...prev]);
            toast.success("Resume uploaded successfully!");
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this resume?")) return;
        try {
            await resumeApi.deleteResume(id);
            setResumes((prev) => prev.filter((r) => r.id !== id));
            toast.success("Resume deleted.");
        } catch {
            toast.error("Failed to delete resume.");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">My Resumes</h1>
                <p className="text-surface-400 mt-1">
                    Upload your resume to apply for jobs and get AI-powered analysis.
                </p>
            </div>

            {/* Drop Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
                style={{
                    borderColor: dragging ? "#2563eb" : "#e2e8f0",
                    backgroundColor: dragging ? "#eff6ff" : "#f8fafc",
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                    }}
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Spinner size="lg" />
                        <p className="text-surface-600 font-medium">Uploading and parsing PDF...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#eff6ff" }}
                        >
                            <Upload className="h-6 w-6" style={{ color: "#2563eb" }} />
                        </div>
                        <div>
                            <p className="font-semibold text-surface-900">
                                Drop your PDF here or{" "}
                                <span style={{ color: "#2563eb" }}>browse</span>
                            </p>
                            <p className="text-sm text-surface-400 mt-1">
                                PDF only · Max 5MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Resume List */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <Spinner size="lg" />
                </div>
            ) : resumes.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No resumes uploaded"
                    description="Upload your first resume to start applying for jobs."
                />
            ) : (
                <div className="space-y-3">
                    {resumes.map((resume) => (
                        <div
                            key={resume.id}
                            className="card p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: "#eff6ff" }}
                                >
                                    <FileText className="h-5 w-5" style={{ color: "#2563eb" }} />
                                </div>
                                <div>
                                    <p className="font-medium text-surface-900">{resume.fileName}</p>
                                    <p className="text-xs text-surface-400 mt-0.5">
                                        {new Date(resume.createdAt).toLocaleDateString("en-ZA", {
                                            year: "numeric", month: "short", day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {resume.hasParsedText && (
                                    <div className="flex items-center gap-1 text-xs font-medium"
                                        style={{ color: "#059669" }}>
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Parsed
                                    </div>
                                )}
                                <button
                                    onClick={() => handleDelete(resume.id)}
                                    className="p-2 rounded-lg transition-colors hover:bg-red-50"
                                    style={{ color: "#dc2626" }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};