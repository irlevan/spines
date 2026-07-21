"use client";

const QUARTERS = [1, 2, 3, 4];

interface RatingStarsProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RatingStars({ value, onChange }: RatingStarsProps) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const fill = Math.max(0, Math.min(1, value - starIndex));
        return (
          <div key={starIndex} className="relative text-5xl leading-none">
            <span className="text-line">★</span>
            <span
              className="absolute inset-y-0 left-0 overflow-hidden text-ribbon"
              style={{ width: `${fill * 100}%` }}
              aria-hidden
            >
              ★
            </span>
            <div className="absolute inset-0 flex">
              {QUARTERS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onChange(starIndex + q * 0.25)}
                  aria-label={`Rate ${starIndex + q * 0.25} out of 5 stars`}
                  className="h-full flex-1"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
