import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[0-9]/, "Must contain a number"),
    role: z.enum(["Candidate", "Recruiter"]),
});

type FormData = z.infer<typeof schema>;

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { setAuth, isAuthenticated, user } = useAuthStore();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(
                user.role === "Recruiter" ? "/recruiter/dashboard" : "/dashboard",
                { replace: true }
            );
        }
    }, [isAuthenticated, user, navigate]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { role: "Candidate" },
    });

    const selectedRole = watch("role");

    const onSubmit = async (data: FormData) => {
        try {
            const response = await authApi.register(data);
            setAuth(response);
            toast.success("Account created successfully!");
            navigate(
                response.role === "Recruiter" ? "/recruiter/dashboard" : "/dashboard"
            );
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Registration failed.");
        }
    };

    return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: "#2563eb" }}
                    >
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900">Create account</h1>
                    <p className="text-surface-400 mt-1">Join the ATS platform</p>
                </div>

                <div className="card p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Role selector */}
                        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg" style={{ backgroundColor: "#f1f5f9" }}>
                            {(["Candidate", "Recruiter"] as const).map((role) => (
                                <label
                                    key={role}
                                    className="flex items-center justify-center py-2 rounded-md text-sm font-medium cursor-pointer transition-all"
                                    style={{
                                        backgroundColor: selectedRole === role ? "white" : "transparent",
                                        color: selectedRole === role ? "#1d4ed8" : "#64748b",
                                        boxShadow: selectedRole === role ? "0 1px 2px rgb(0 0 0 / 0.05)" : "none",
                                    }}
                                >
                                    <input
                                        {...register("role")}
                                        type="radio"
                                        value={role}
                                        className="sr-only"
                                    />
                                    {role}
                                </label>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="label">First Name</label>
                                <input {...register("firstName")} placeholder="John" className="input-field" />
                                {errors.firstName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="label">Last Name</label>
                                <input {...register("lastName")} placeholder="Doe" className="input-field" />
                                {errors.lastName && (
                                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="label">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="you@example.com"
                                className="input-field"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <input
                                {...register("password")}
                                type="password"
                                placeholder="Min 8 chars, 1 uppercase, 1 number"
                                className="input-field"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full mt-2"
                        >
                            {isSubmitting ? "Creating account..." : "Create account"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-surface-400 mt-4">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium hover:underline"
                        style={{ color: "#2563eb" }}
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};