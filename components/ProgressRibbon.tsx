interface ProgressRibbonProps {
  percent: number;
  variant?: "vertical" | "horizontal";
  className?: string;
}

// A bookmark-ribbon shaped progress indicator. Vertical hangs down the spine
// of a cover to the depth reached in the book, cut with the same V-notch a
// real ribbon bookmark has at its loose end. Horizontal is the same idea
// flattened into a reading bar.
export default function ProgressRibbon({
  percent,
  variant = "vertical",
  className = "",
}: ProgressRibbonProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  if (variant === "horizontal") {
    return (
      <div
        className={`relative h-2 w-full overflow-hidden rounded-full bg-surface-2 ${className}`}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-ribbon transition-[width] duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            clipPath:
              clamped >= 100
                ? undefined
                : "polygon(0 0, calc(100% - 7px) 0, 100% 50%, calc(100% - 7px) 100%, 0 100%)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute left-3 top-0 w-2.5 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="bg-ribbon shadow-sm transition-[height] duration-500 ease-out"
        style={{
          height: `${clamped}%`,
          minHeight: clamped > 0 ? "1.25rem" : 0,
          clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 9px), 50% 100%, 0 calc(100% - 9px))",
        }}
      />
    </div>
  );
}
