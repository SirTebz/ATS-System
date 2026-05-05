import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
}: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
            className="p-4 rounded-full mb-4"
            style={{ backgroundColor: "#f1f5f9" }}
        >
            <Icon className="h-8 w-8" style={{ color: "#94a3b8" }} />
        </div>
        <h3 className="text-lg font-semibold mb-1" style={{ color: "#334155" }}>
            {title}
        </h3>
        <p className="text-sm max-w-sm mb-4" style={{ color: "#94a3b8" }}>
            {description}
        </p>
        {action}
    </div>
);