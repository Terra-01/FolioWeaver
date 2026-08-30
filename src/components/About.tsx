// src/components/About.tsx
"use client";
import { useMemo } from 'react';

type AboutProps = {
  contentHtml: string;
  keywords?: string[];
  learning?: string[];
};

// Keywords are user input, so every regex metacharacter in them has to be
// literal. Without this, a skill named "C++" or "C#" — both offered by the
// editor's own suggestion list — throws `Invalid regular expression: Nothing
// to repeat` during render, and there is no error boundary to catch it.
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function About({ contentHtml, keywords = [], learning = [] }: AboutProps) {
  const highlightedHtml = useMemo(() => {
    const terms = (keywords ?? []).map((k) => k.trim()).filter(Boolean);
    if (terms.length === 0) return contentHtml;

    // Longest first, so "React Native" wins over "React" at the same position.
    const pattern = [...terms]
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|');

    let regex: RegExp;
    try {
      regex = new RegExp(`(${pattern})`, 'gi');
    } catch {
      return contentHtml;
    }

    // Substitute inside text only, never inside a tag. A blind replace over the
    // whole string rewrites the markup itself when a keyword happens to be
    // "span", "div" or "class".
    return contentHtml.replace(/<[^>]*>|[^<]+/g, (chunk) =>
      chunk.startsWith('<')
        ? chunk
        : chunk.replace(
            regex,
            (match) => `<span class="font-bold text-[var(--color-accent-primary)]">${match}</span>`
          )
    );
  }, [contentHtml, keywords]);

  return (
    <section id="about">
      <h2 className="text-base font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-6">About</h2>
      <div className="bg-[var(--color-bg-secondary)] rounded-md p-6 transition-shadow shadow-[0_4px_14px_0_var(--color-shadow)]/10 hover:shadow-[0_6px_20px_0_var(--color-shadow)]/20">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        {learning && learning.length > 0 && (
          <>
            <div className="border-t border-[var(--color-border-primary)] my-6"></div>
            <h3 className="text-md font-semibold text-[var(--color-text-primary)] mb-3">Currently Exploring</h3>
            <div className="flex flex-wrap gap-2">
              {learning.map((item, index) => (
                <div key={index} className="bg-[var(--color-bg-tertiary)] text-[var(--color-accent-primary)] font-medium py-1 px-3 rounded-full text-sm">
                  {item}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}