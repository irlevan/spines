"use client";

import { useDroppable } from "@dnd-kit/core";

interface ShelfColumnProps {
  id: string;
  children: React.ReactNode;
}

export default function ShelfColumn({ id, children }: ShelfColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 rounded-xl p-1.5 transition-colors ${
        isOver ? "bg-ribbon-soft ring-2 ring-ribbon/50" : ""
      }`}
    >
      {children}
    </div>
  );
}
