// src/components/TagInput.tsx (Enhanced Version)
"use client";

import { useState } from 'react';

type TagInputProps = {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder: string;
};

export default function TagInput({ tags, setTags, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
      return;
    }

    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.replace(/'/g, ''));
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-[var(--color-bg-tertiary)] border border-transparent rounded-md p-2 focus-within:border-[var(--color-accent-primary)] transition-colors">
      {tags.map((tag, index) => (
        <div key={index} className="flex items-center gap-1.5 bg-[var(--color-bg-primary)] text-[var(--color-accent-primary)] font-medium py-1 pl-3 pr-2 rounded-full text-sm">
          <span>{tag}</span>
          <button onClick={() => removeTag(index)} className="text-[var(--color-text-muted)] hover:text-white rounded-full hover:bg-red-500/50 w-4 h-4 flex items-center justify-center">
            ×
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-grow bg-transparent focus:outline-none p-1 min-w-[100px]"
      />
    </div>
  );
}