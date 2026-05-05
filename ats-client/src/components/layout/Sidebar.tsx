import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    Users,
    PlusCircle,
    BarChart2,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils/cn";

const candidateLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/resumes", label: "My Resumes", icon: FileText },
    { to: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { to: "/applications", label: "Applications", icon: BarChart2 },
];

const recruiterLinks = [
    { to: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/recruiter/jobs", label: "My Jobs", icon: Briefcase },
    { to: "/recruiter/jobs/new", label: "Post a Job", icon: PlusCircle },
    { to: "/recruiter/candidates", label: "Candidates", icon: Users },
];

export const Sidebar = () => {
    const { user } = useAuthStore();
    const links = user?.role === "Recruiter" ? recruiterLinks : candidateLinks;

    return (
        <aside className="w-60 bg-white border-r border-surface-200 fixed top-16 left-0 bottom-0 z-20 overflow-y-auto">
            <nav className="p-4 space-y-1">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                            )
                        }
                    >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};