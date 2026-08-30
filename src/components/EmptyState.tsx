// src/components/EmptyState.tsx
"use client";

import { PlusCircle } from 'lucide-react';

type EmptyStateProps = {
  Icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
};

export default function EmptyState({ Icon, title, description, buttonText, onButtonClick }: EmptyStateProps) {
  return (
    <div className="text-center bg-[var(--color-bg-primary)] p-8 rounded-lg border-2 border-dashed border-[var(--color-border-primary)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)]">
        <Icon className="h-6 w-6 text-[var(--color-text-muted)]" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onButtonClick}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent-solid)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-accent-solid-hover)] transition-colors"
        >
          <PlusCircle className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          {buttonText}
        </button>
      </div>
    </div>
  );
}