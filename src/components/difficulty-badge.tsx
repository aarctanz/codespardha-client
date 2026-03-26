const DIFFICULTY: Record<number, { label: string; className: string }> = {
  1: { label: "Easy", className: "text-green-600 dark:text-green-400" },
  2: { label: "Medium", className: "text-yellow-600 dark:text-yellow-400" },
  3: { label: "Hard", className: "text-red-600 dark:text-red-400" },
};

export function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const info = DIFFICULTY[difficulty];
  if (!info) return <span>{difficulty}</span>;
  return <span className={`text-sm font-medium ${info.className}`}>{info.label}</span>;
}
