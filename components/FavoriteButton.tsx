"use client";

import { useState } from "react";

interface FavoriteButtonProps {
  bookId: string;
  initialFavorite: boolean;
  size?: "sm" | "lg";
  className?: string;
  onToggle?: (bookId: string, favorite: boolean) => void;
}

export default function FavoriteButton({
  bookId,
  initialFavorite,
  size = "sm",
  className = "",
  onToggle,
}: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(initialFavorite);

  async function toggle() {
    const next = !favorite;
    setFavorite(next);
    onToggle?.(bookId, next);
    await fetch(`/api/books/${bookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: next }),
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={favorite}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      className={`transition-transform hover:scale-110 ${
        favorite ? "text-lamp" : "text-subtle hover:text-lamp"
      } ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        className={size === "lg" ? "h-6 w-6" : "h-4 w-4"}
        fill={favorite ? "currentColor" : "none"}
      >
        <path
          d="M10 16.5 4.5 12.2C2.2 10.3 2 7 4.2 5.3a4 4 0 0 1 5.7.9l.1.2.1-.2a4 4 0 0 1 5.7-.9c2.2 1.7 2.4 5 .1 6.9L10 16.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
