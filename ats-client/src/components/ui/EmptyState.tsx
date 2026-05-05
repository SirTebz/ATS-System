import { LucideIcon } from "lucide-react";

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
        <div className="p-4 bg-surface-100 rounded-full mb-4">
            <Icon className="h-8 w-8 text-surface-400" />
        </div>
        <h3 className="text-lg font-semibold text-surface-700 mb-1">{title}</h3>
        <p className="text-sm text-surface-400 max-w-sm mb-4">{description}</p>
        {action}
    </div>
);