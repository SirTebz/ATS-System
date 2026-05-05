import type { ApplicationStatus } from "../../types/index";

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
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        style={{
            backgroundColor:
                status === "Shortlisted" ? "#dcfce7"
                    : status === "Hired" ? "#f3e8ff"
                        : status === "Rejected" ? "#fee2e2"
                            : status === "UnderReview" ? "#dbeafe"
                                : "#fef9c3",
            color:
                status === "Shortlisted" ? "#166534"
                    : status === "Hired" ? "#6b21a8"
                        : status === "Rejected" ? "#991b1b"
                            : status === "UnderReview" ? "#1e40af"
                                : "#854d0e",
        }}
    >
        {status}
    </span>
);