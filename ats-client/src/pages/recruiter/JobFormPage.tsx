import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Briefcase } from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { Spinner } from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const schema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    company: z.string().min(2, "Company name is required"),
    location: z.string().min(2, "Location is required"),
});

type FormData = z.infer<typeof schema>;

export const JobFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id && id !== "new";
    const [loadingJob, setLoadingJob] = useState(isEditing);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    useEffect(() => {
        if (!isEditing) return;
        const load = async () => {
            try {
                const job = await jobApi.getJobById(id!);
                reset({
                    title: job.title,
                    description: job.description,
                    company: job.company,
                    location: job.location,
                });
            } catch {
                toast.error("Failed to load job.");
                navigate("/recruiter/dashboard");
            } finally {
                setLoadingJob(false);
            }
        };
        load();
    }, [id, isEditing, navigate, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (isEditing) {
                await jobApi.updateJob(id!, data);
                toast.success("Job updated successfully!");
            } else {
                await jobApi.createJob(data);
                toast.success("Job posted successfully!");
            }
            navigate("/recruiter/dashboard");
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Failed to save job.");
        }
    };

    if (loadingJob) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    to="/recruiter/dashboard"
                    className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-surface-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">
                        {isEditing ? "Edit Job" : "Post a New Job"}
                    </h1>
                    <p className="text-surface-400 mt-0.5 text-sm">
                        {isEditing
                            ? "Update the details of your job posting."
                            : "Fill in the details to attract the right candidates."}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="card p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className="label">Job Title *</label>
                        <input
                            {...register("title")}
                            placeholder="e.g. Senior .NET Developer"
                            className="input-field"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Company + Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Company *</label>
                            <input
                                {...register("company")}
                                placeholder="e.g. TechCorp Ltd"
                                className="input-field"
                            />
                            {errors.company && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.company.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="label">Location *</label>
                            <input
                                {...register("location")}
                                placeholder="e.g. Johannesburg, SA"
                                className="input-field"
                            />
                            {errors.location && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.location.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">Job Description *</label>
                        <textarea
                            {...register("description")}
                            placeholder="Describe the role, responsibilities, requirements, and any preferred qualifications..."
                            rows={10}
                            className="input-field resize-none"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.description.message}
                            </p>
                        )}
                        <p className="text-xs text-surface-400 mt-1">
                            Tip: Include specific skills, tools, and technologies to improve
                            AI matching accuracy.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <Link
                            to="/recruiter/dashboard"
                            className="btn-secondary flex items-center gap-2 text-sm"
                            style={{ width: "auto" }}
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary flex items-center gap-2 text-sm"
                            style={{ width: "auto" }}
                        >
                            {isSubmitting ? (
                                <Spinner size="sm" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isEditing ? "Save Changes" : "Post Job"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tips */}
            <div
                className="rounded-xl p-4 border text-sm space-y-2"
                style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}
            >
                <div className="flex items-center gap-2 font-semibold" style={{ color: "#1d4ed8" }}>
                    <Briefcase className="h-4 w-4" />
                    Tips for better AI matching
                </div>
                <ul className="space-y-1 text-surface-600 pl-6 list-disc">
                    <li>List specific technologies (e.g., React, .NET Core, Docker)</li>
                    <li>Include years of experience required</li>
                    <li>Mention soft skills and team dynamics</li>
                    <li>Describe day-to-day responsibilities clearly</li>
                    <li>Include any certifications or degree requirements</li>
                </ul>
            </div>
        </div>
    );
};