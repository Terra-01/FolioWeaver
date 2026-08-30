// src/components/Projects.tsx
import IconGithub from './icons/IconGithub';
import IconExternalLink from './icons/IconExternalLink';

// Prepends "https://" to a URL if it doesn't have a protocol.
const formatUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

type Project = {
  name: string;
  link?: string;
  github?: string;
  tech: string[];
  description: string[];
};

type ProjectsProps = {
  projects: Project[];
};

export default function Projects({ projects = [] }: ProjectsProps) {
  return (
    <section id="projects">
      <h2 className="text-base font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-6">Projects</h2>
      <div className="bg-[var(--color-bg-secondary)] rounded-md p-6 transition-shadow shadow-[0_4px_14px_0_var(--color-shadow)]/10 hover:shadow-[0_6px_20px_0_var(--color-shadow)]/20">
        {projects.map((project, index) => (
          <div key={index} className="[&:not(:last-child)]:mb-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{project.name}</h3>
              <div className="flex items-center gap-4">
                {project.link && (
                  <a href={formatUrl(project.link)} target="_blank" rel="noopener noreferrer" aria-label="External link" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]">
                    <IconExternalLink size={20} />
                  </a>
                )}
                {project.github && (
                  <a href={formatUrl(project.github)} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]">
                    <IconGithub size={20} />
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech.map((tech, techIndex) => (
                <div key={techIndex} className="bg-[var(--color-bg-tertiary)] text-[var(--color-accent-primary)] font-medium py-1 px-3 rounded-full text-xs">
                  {tech}
                </div>
              ))}
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm md:text-base text-[var(--color-text-secondary)]">
              {project.description.map((point, pointIndex) => (
                <li key={pointIndex}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}