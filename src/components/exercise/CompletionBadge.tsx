interface Props {
  completed: boolean;
}

export function CompletionBadge({ completed }: Props) {
  if (!completed) return null;
  return (
    <span
      aria-label="Completed"
      className="inline-flex items-center gap-1 rounded-full bg-court-green px-2 py-0.5 text-xs font-semibold text-white"
    >
      ✓ Done
    </span>
  );
}
