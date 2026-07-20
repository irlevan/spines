"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Book } from "@prisma/client";
import BookCard from "./BookCard";

interface DraggableBookCardProps {
  book: Book;
  onShelfChange: (bookId: string, shelf: string) => void;
  onRemove: (bookId: string) => void;
  onFavoriteToggle: (bookId: string, favorite: boolean) => void;
}

export default function DraggableBookCard({
  book,
  onShelfChange,
  onRemove,
  onFavoriteToggle,
}: DraggableBookCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } =
    useDraggable({ id: book.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <BookCard
        book={book}
        onShelfChange={onShelfChange}
        onRemove={onRemove}
        onFavoriteToggle={onFavoriteToggle}
        dragHandle={
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            type="button"
            aria-label={`Drag ${book.title} to a different shelf`}
            className="absolute left-2 top-2 z-[1] touch-none rounded-full bg-surface/80 p-1 text-subtle opacity-0 backdrop-blur-sm transition-opacity hover:text-ribbon focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <circle cx="7" cy="6" r="1.2" />
              <circle cx="13" cy="6" r="1.2" />
              <circle cx="7" cy="10" r="1.2" />
              <circle cx="13" cy="10" r="1.2" />
              <circle cx="7" cy="14" r="1.2" />
              <circle cx="13" cy="14" r="1.2" />
            </svg>
          </button>
        }
      />
    </div>
  );
}
