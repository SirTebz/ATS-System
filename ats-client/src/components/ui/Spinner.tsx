import { cn } from "../../utils/cn";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const Spinner = ({ size = "md", className }: SpinnerProps) => {
    const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-2 border-surface-200 border-t-primary-600",
                sizes[size],
                className
            )}
        />
    );
};