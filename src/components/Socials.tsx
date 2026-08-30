// src/components/Socials.tsx
import { SettingsData } from './PortfolioLayout';
import IconGithub from './icons/IconGithub';
import IconLinkedin from './icons/IconLinkedin';
import IconX from './icons/IconX';
import IconMail from './icons/IconMail';

// The component now accepts props
type SocialsProps = {
  settings: SettingsData;
};

export default function Socials({ settings }: SocialsProps) {
  const formatUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {settings.github && (
        <a href={formatUrl(`github.com/${settings.github}`)} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors">
          <IconGithub size={22} />
        </a>
      )}
      {settings.linkedin && (
        <a href={formatUrl(`linkedin.com/in/${settings.linkedin}`)} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors">
          <IconLinkedin size={22} />
        </a>
      )}
      {settings.x && (
        <a href={formatUrl(`x.com/${settings.x}`)} target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter) profile" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors">
          <IconX size={18} />
        </a>
      )}
      {settings.email && (
        <a href={`mailto:${settings.email}`} aria-label="Email address" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors">
          <IconMail size={24} />
        </a>
      )}
    </div>
  );
}