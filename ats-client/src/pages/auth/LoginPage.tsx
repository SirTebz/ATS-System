import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
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
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FormData) => {
        try {
            const response = await authApi.login(data);
            setAuth(response);
            toast.success(`Welcome back, ${response.fullName}!`);
            navigate(
                response.role === "Recruiter" ? "/recruiter/dashboard" : "/dashboard"
            );
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? "Login failed.");
        }
    };

    return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: "#2563eb" }}
                    >
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900">Welcome back</h1>
                    <p className="text-surface-400 mt-1">Sign in to your ATS account</p>
                </div>

                <div className="card p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="you@example.com"
                                className="input-field"
                                autoComplete="email"
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
                                placeholder="••••••••"
                                className="input-field"
                                autoComplete="current-password"
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
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-surface-400 mt-4">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium hover:underline"
                        style={{ color: "#2563eb" }}
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};