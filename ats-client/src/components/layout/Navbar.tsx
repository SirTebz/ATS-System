import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export const Navbar = () => {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-30">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-semibold text-surface-900">ATS System</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-surface-600" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-surface-900">{user?.fullName}</p>
                        <p className="text-xs text-surface-400">{user?.role}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-surface-600 hover:text-red-600 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};