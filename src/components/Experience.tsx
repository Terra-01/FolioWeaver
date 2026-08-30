// src/components/Experience.tsx
import { Job } from './PortfolioLayout';
import { formatPeriod } from '@/lib/utils';
import { sortPeriodsDescending } from '@/lib/utils';

type ExperienceProps = {
  jobs: Job[];
};

export default function Experience({ jobs = [] }: ExperienceProps) {

  const sortedJobs = [...jobs].sort((a, b) => {
    if (typeof a.period !== 'object' || typeof b.period !== 'object') return 0;
    return sortPeriodsDescending(a.period, b.period);
  });

  return (
    <section id="experience">
      <h2 className="text-base font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-6">Experience</h2>
      <div className="bg-[var(--color-bg-secondary)] rounded-md p-6 transition-shadow shadow-[0_4px_14px_0_var(--color-shadow)]/10 hover:shadow-[0_6px_20px_0_var(--color-shadow)]/20">
        {sortedJobs.map((job, index) => (
          <div key={index} className="[&:not(:last-child)]:mb-8">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{job.role}</h3>
            <p className="text-md text-[var(--color-text-secondary)] mt-1">
              {job.company} | {formatPeriod(job.period)}
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1 text-sm md:text-base text-[var(--color-text-secondary)]">
              {job.description.map((point, pointIndex) => (
                <li key={pointIndex}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}