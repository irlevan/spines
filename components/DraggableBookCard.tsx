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
            className="flex w-full cursor-grab touch-none items-center justify-center rounded-t-[0.875rem] border-b border-line/70 bg-surface-2/70 py-1.5 text-subtle transition-colors hover:bg-ribbon-soft hover:text-ribbon active:cursor-grabbing"
          >
            <svg viewBox="0 0 32 8" className="h-2 w-8" fill="currentColor">
              <circle cx="4" cy="4" r="1.4" />
              <circle cx="11" cy="4" r="1.4" />
              <circle cx="18" cy="4" r="1.4" />
              <circle cx="25" cy="4" r="1.4" />
            </svg>
          </button>
        }
      />
    </div>
  );
}
