// src/components/SortableItem.tsx
"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function SortableItem({ id, children, showDragHandle = false }: { id: string, children: React.ReactNode, showDragHandle?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
        {/* --- Conditionally render the drag handle --- */}
        {showDragHandle && (
            <div 
                {...attributes} 
                {...listeners} 
                // This handle is invisible by default and appears only when hovering over the item (`group-hover`).
                className="absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab touch-none p-1 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-opacity opacity-0 group-hover:opacity-100"
            >
                <GripVertical size={18} />
            </div>
        )}

        <div>
            {children}
        </div>
    </div>
  );
}