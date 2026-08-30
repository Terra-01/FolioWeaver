// src/components/Skills.tsx
type SkillCategory = {
  name: string;
  skills: string[];
};

type SkillsProps = {
  categories: SkillCategory[];
};

export default function Skills({ categories = [] }: SkillsProps) {
  return (
    <section id="skills">
      <h2 className="text-base font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-6">Skills</h2>
      <div className="bg-[var(--color-bg-secondary)] rounded-md p-6 transition-shadow shadow-[0_4px_14px_0_var(--color-shadow)]/10 hover:shadow-[0_6px_20px_0_var(--color-shadow)]/20">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="[&:not(:last-child)]:mb-6">
            <h3 className="text-md font-semibold text-[var(--color-text-primary)] mb-3">{category.name}</h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="bg-[var(--color-bg-tertiary)] text-[var(--color-accent-primary)] font-medium py-1 px-3 rounded-full text-sm">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}