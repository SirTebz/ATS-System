interface ScoreRingProps {
    score: number;
    size?: number;
}

export const ScoreRing = ({ score, size = 120 }: ScoreRingProps) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const color =
        score >= 70 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";

    const bgColor =
        score >= 70 ? "#ecfdf5" : score >= 50 ? "#fffbeb" : "#fef2f2";

    return (
        <div
            className="relative flex items-center justify-center rounded-full"
            style={{ width: size, height: size, backgroundColor: bgColor }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                className="absolute inset-0 -rotate-90"
                style={{ transform: "rotate(-90deg)" }}
            >
                {/* Background ring */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                />
                {/* Score ring */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                />
            </svg>
            <div className="relative text-center">
                <p className="text-2xl font-bold" style={{ color }}>
                    {Math.round(score)}%
                </p>
                <p className="text-xs font-medium text-surface-400">Match</p>
            </div>
        </div>
    );
};