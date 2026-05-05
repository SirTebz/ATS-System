import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
    allowedRole?: "Candidate" | "Recruiter" | "Admin";
}

export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user?.role !== allowedRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};