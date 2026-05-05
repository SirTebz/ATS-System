import { cn } from "../../utils/cn";
import { ApplicationStatus } from "../../types";

const statusStyles: Record<ApplicationStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    UnderReview: "bg-blue-100 text-blue-700",
    Shortlisted: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Hired: "bg-purple-100 text-purple-700",
};

interface BadgeProps {
    status: ApplicationStatus;
}

export const StatusBadge = ({ status }: BadgeProps) => (
    <span
        className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            statusStyles[status]
        )}
    >
        {status}
    </span>
);