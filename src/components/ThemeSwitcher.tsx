// src/components/ThemeSwitcher.tsx
"use client";

import { useTheme } from './ThemeProvider';
import IconPalette from './icons/IconPalette';

const themes = [
  { value: 'dark-slate', label: 'Dark Slate' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'cinder', label: 'Cinder' },
  { value: 'cocogoat', label: 'Cocogoat (Light)' },
  { value: 'dandy-r1', label: 'Dandy R1 (Light)' },
  { value: 'dolch', label: 'Dolch' },
  { value: 'evil-dolch', label: 'Evil Dolch' },
  { value: 'kaiju', label: 'Kaiju' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'metropolis', label: 'Metropolis' },
  { value: 'miami-dusk', label: 'Miami Dusk' },
  { value: 'miami-nights', label: 'Miami Nights' },
  { value: 'mictlan', label: 'Mictlán' },
  { value: 'olive', label: 'Olive' },
  { value: 'perestroika', label: 'Perestroika' },
  { value: 'phantom', label: 'Phantom' },
  { value: 'prussian-blue', label: 'Prussian Blue' },
  { value: 'slasher', label: 'Slasher' },
  { value: 'solarized-dark', label: 'Solarized Dark' },
  { value: 'tiramisu', label: 'Tiramisu (Light)' },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <IconPalette size={20} className="text-[var(--color-text-muted)]" />
      <div className="relative">
        <label htmlFor="theme-switcher" className="sr-only">Select a theme</label>
        
        <select
          id="theme-switcher"
          name="theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="appearance-none w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
          autoComplete="off"
        >
          {themes.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text-muted)]">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}