// src/components/DownloadCV.tsx
import IconDownload from './icons/IconDownload';

type DownloadCVProps = {
  cvPath: string;
};

export default function DownloadCV({ cvPath }: DownloadCVProps) {
  // Return null if no CV path is provided
  if (!cvPath) return null;

  // cvPath comes from editable front matter, so it must not be able to become a
  // `javascript:` or `data:` URL in the published portfolio. Only a same-origin
  // path is ever a legitimate value here.
  if (!/^\/[^/\\]/.test(cvPath)) return null;

  return (
    <a
      href={cvPath}
      download // Can make the download name dynamic if needed
      className="group flex items-center gap-2 border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] py-2 px-4 rounded-lg transition-colors duration-300 hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
    >
      <IconDownload size={18} className="transition-transform group-hover:-translate-y-px" />
      <span>Download CV</span>
    </a>
  );
}