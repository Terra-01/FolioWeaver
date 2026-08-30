// src/components/SmartTagInput.tsx
"use client";

import { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown } from 'lucide-react';

const ALL_SUGGESTIONS = [
    // Languages
    { category: 'Languages', name: 'JavaScript' }, { category: 'Languages', name: 'TypeScript' },
    { category: 'Languages', name: 'Python' }, { category: 'Languages', name: 'Java' },
    { category: 'Languages', name: 'C#' }, { category: 'Languages', name: 'C++' },
    { category: 'Languages', name: 'Go' }, { category: 'Languages', name: 'Rust' },
    { category: 'Languages', name: 'PHP' }, { category: 'Languages', name: 'SQL' },
    { category: 'Languages', name: 'HTML5' }, { category: 'Languages', name: 'CSS3' },
    { category: 'Languages', name: 'Kotlin' }, { category: 'Languages', name: 'Swift' },
    { category: 'Languages', name: 'Objective-C' }, { category: 'Languages', name: 'R' },
    { category: 'Languages', name: 'MATLAB' }, { category: 'Languages', name: 'Dart' },
    { category: 'Languages', name: 'Scala' }, { category: 'Languages', name: 'Perl' },
    { category: 'Languages', name: 'Shell Scripting (Bash/Zsh)' }, { category: 'Languages', name: 'Elixir' },
    { category: 'Languages', name: 'Haskell' },
  
    // Frontend
    { category: 'Frontend', name: 'React' }, { category: 'Frontend', name: 'Next.js' },
    { category: 'Frontend', name: 'Vue.js' }, { category: 'Frontend', name: 'Angular' },
    { category: 'Frontend', name: 'Svelte' }, { category: 'Frontend', name: 'Tailwind CSS' },
    { category: 'Frontend', name: 'Framer Motion' }, { category: 'Frontend', name: 'Three.js' },
    { category: 'Frontend', name: 'Webpack' }, { category: 'Frontend', name: 'Vite' },
    { category: 'Frontend', name: 'React Native' }, { category: 'Frontend', name: 'Ionic' },
    { category: 'Frontend', name: 'Bootstrap' }, { category: 'Frontend', name: 'Material UI' },
    { category: 'Frontend', name: 'Chakra UI' }, { category: 'Frontend', name: 'GSAP' },
    { category: 'Frontend', name: 'Redux' }, { category: 'Frontend', name: 'MobX' },
    { category: 'Frontend', name: 'Storybook' }, { category: 'Frontend', name: 'Jest' },
    { category: 'Frontend', name: 'Cypress' }, { category: 'Frontend', name: 'Playwright' },
  
    // Backend
    { category: 'Backend', name: 'Node.js' }, { category: 'Backend', name: 'Express.js' },
    { category: 'Backend', name: 'Django' }, { category: 'Backend', name: 'Flask' },
    { category: 'Backend', name: 'Ruby on Rails' }, { category: 'Backend', name: 'ASP.NET' },
    { category: 'Backend', name: 'Spring Boot' }, { category: 'Backend', name: 'GraphQL' },
    { category: 'Backend', name: 'REST APIs' }, { category: 'Backend', name: 'FastAPI' },
    { category: 'Backend', name: 'NestJS' }, { category: 'Backend', name: 'Laravel' },
    { category: 'Backend', name: 'Phoenix (Elixir)' }, { category: 'Backend', name: 'Fiber (Go)' },
    { category: 'Backend', name: 'Socket.IO' }, { category: 'Backend', name: 'gRPC' },
    { category: 'Backend', name: 'tRPC' }, { category: 'Backend', name: 'Microservices Architecture' },
    { category: 'Backend', name: 'Serverless Functions' },
  
    // Databases
    { category: 'Databases', name: 'PostgreSQL' }, { category: 'Databases', name: 'MySQL' },
    { category: 'Databases', name: 'MongoDB' }, { category: 'Databases', name: 'Redis' },
    { category: 'Databases', name: 'SQLite' }, { category: 'Databases', name: 'Firebase' },
    { category: 'Databases', name: 'Oracle DB' }, { category: 'Databases', name: 'Cassandra' },
    { category: 'Databases', name: 'CouchDB' }, { category: 'Databases', name: 'Neo4j' },
    { category: 'Databases', name: 'DynamoDB' }, { category: 'Databases', name: 'Elasticsearch' },
    { category: 'Databases', name: 'TimescaleDB' }, { category: 'Databases', name: 'ClickHouse' },
  
    // DevOps & Cloud
    { category: 'DevOps & Cloud', name: 'Docker' }, { category: 'DevOps & Cloud', name: 'Kubernetes' },
    { category: 'DevOps & Cloud', name: 'Git' }, { category: 'DevOps & Cloud', name: 'CI/CD' },
    { category: 'DevOps & Cloud', name: 'GitHub Actions' }, { category: 'DevOps & Cloud', name: 'Jenkins' },
    { category: 'DevOps & Cloud', name: 'AWS' }, { category: 'DevOps & Cloud', name: 'Google Cloud (GCP)' },
    { category: 'DevOps & Cloud', name: 'Azure' }, { category: 'DevOps & Cloud', name: 'Vercel' },
    { category: 'DevOps & Cloud', name: 'Terraform' }, { category: 'DevOps & Cloud', name: 'Ansible' },
    { category: 'DevOps & Cloud', name: 'Puppet' }, { category: 'DevOps & Cloud', name: 'Chef' },
    { category: 'DevOps & Cloud', name: 'OpenShift' }, { category: 'DevOps & Cloud', name: 'ArgoCD' },
    { category: 'DevOps & Cloud', name: 'Helm' }, { category: 'DevOps & Cloud', name: 'Cloudflare' },
    { category: 'DevOps & Cloud', name: 'Netlify' }, { category: 'DevOps & Cloud', name: 'Heroku' },
    { category: 'DevOps & Cloud', name: 'DigitalOcean' }, { category: 'DevOps & Cloud', name: 'CloudWatch' },
    { category: 'DevOps & Cloud', name: 'Prometheus' }, { category: 'DevOps & Cloud', name: 'Grafana' },
    { category: 'DevOps & Cloud', name: 'Sentry' }, { category: 'DevOps & Cloud', name: 'New Relic' },
  
    // Testing & QA
    { category: 'Testing & QA', name: 'Unit Testing' }, { category: 'Testing & QA', name: 'Integration Testing' },
    { category: 'Testing & QA', name: 'End-to-End Testing' }, { category: 'Testing & QA', name: 'TDD' },
    { category: 'Testing & QA', name: 'BDD' }, { category: 'Testing & QA', name: 'Selenium' },
    { category: 'Testing & QA', name: 'JUnit' }, { category: 'Testing & QA', name: 'Mocha' },
    { category: 'Testing & QA', name: 'Chai' },
  
    // Data & AI/ML
    { category: 'Data & AI/ML', name: 'Pandas' }, { category: 'Data & AI/ML', name: 'NumPy' },
    { category: 'Data & AI/ML', name: 'Matplotlib' }, { category: 'Data & AI/ML', name: 'Seaborn' },
    { category: 'Data & AI/ML', name: 'TensorFlow' }, { category: 'Data & AI/ML', name: 'PyTorch' },
    { category: 'Data & AI/ML', name: 'Scikit-learn' }, { category: 'Data & AI/ML', name: 'Keras' },
    { category: 'Data & AI/ML', name: 'OpenCV' }, { category: 'Data & AI/ML', name: 'NLTK' },
    { category: 'Data & AI/ML', name: 'Hugging Face Transformers' }, { category: 'Data & AI/ML', name: 'BigQuery' },
    { category: 'Data & AI/ML', name: 'Data Visualization' }, { category: 'Data & AI/ML', name: 'ETL Pipelines' },
  
    // Security
    { category: 'Security', name: 'OAuth' }, { category: 'Security', name: 'JWT' },
    { category: 'Security', name: 'Penetration Testing' }, { category: 'Security', name: 'OWASP' },
    { category: 'Security', name: 'Cybersecurity Fundamentals' }, { category: 'Security', name: 'SSL/TLS' },
    { category: 'Security', name: 'Cloud Security' }, { category: 'Security', name: 'Vulnerability Scanning' },
    { category: 'Security', name: 'Identity and Access Management (IAM)' },
  
    // Soft Skills
    { category: 'Soft Skills', name: 'Teamwork' }, { category: 'Soft Skills', name: 'Collaboration' },
    { category: 'Soft Skills', name: 'Communication' }, { category: 'Soft Skills', name: 'Problem-Solving' },
    { category: 'Soft Skills', name: 'Agile Methodologies' }, { category: 'Soft Skills', name: 'Scrum' },
    { category: 'Soft Skills', name: 'Project Management' }, { category: 'Soft Skills', name: 'Leadership' },
    { category: 'Soft Skills', name: 'Mentoring' }, { category: 'Soft Skills', name: 'Public Speaking' },
    { category: 'Soft Skills', name: 'Time Management' }, { category: 'Soft Skills', name: 'Critical Thinking' },
    { category: 'Soft Skills', name: 'Conflict Resolution' }, { category: 'Soft Skills', name: 'Adaptability' },
    { category: 'Soft Skills', name: 'Creativity' }, { category: 'Soft Skills', name: 'Decision Making' },
    { category: 'Soft Skills', name: 'Empathy' }, { category: 'Soft Skills', name: 'Emotional Intelligence' },
    { category: 'Soft Skills', name: 'Active Listening' }, { category: 'Soft Skills', name: 'Negotiation' },
    { category: 'Soft Skills', name: 'Stakeholder Management' },
  
    // Design & Other
    { category: 'Design & Other', name: 'UI/UX Design' }, { category: 'Design & Other', name: 'Figma' },
    { category: 'Design & Other', name: 'Data Analysis' }, { category: 'Design & Other', name: 'Product Management' },
    { category: 'Design & Other', name: 'Adobe XD' }, { category: 'Design & Other', name: 'Sketch' },
    { category: 'Design & Other', name: 'Canva' }, { category: 'Design & Other', name: 'Webflow' },
    { category: 'Design & Other', name: 'Notion' }, { category: 'Design & Other', name: 'Miro' },
    { category: 'Design & Other', name: 'Wireframing' }, { category: 'Design & Other', name: 'Prototyping' },
    { category: 'Design & Other', name: 'Design Systems' }, { category: 'Design & Other', name: 'Business Analysis' },
    { category: 'Design & Other', name: 'A/B Testing' }, { category: 'Design & Other', name: 'SEO' },
    { category: 'Design & Other', name: 'Content Strategy' },
];

function groupByCategory(suggestions: (typeof ALL_SUGGESTIONS)) {
    return suggestions.reduce((acc, suggestion) => {
      (acc[suggestion.category] = acc[suggestion.category] || []).push(suggestion);
      return acc;
    }, {} as Record<string, typeof ALL_SUGGESTIONS>);
  }
  
  type SmartTagInputProps = {
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder: string;
  };
  
  export default function SmartTagInput({ tags, setTags, placeholder }: SmartTagInputProps) {
    const [query, setQuery] = useState('');
  
    const filteredSuggestions = query === ''
      ? ALL_SUGGESTIONS.filter(suggestion => !tags.includes(suggestion.name))
      : ALL_SUGGESTIONS.filter(suggestion => {
          return !tags.includes(suggestion.name) && suggestion.name.toLowerCase().includes(query.toLowerCase());
        });
    
    const groupedSuggestions = groupByCategory(filteredSuggestions);
  
    const addTag = (tagToAdd: string | null) => {
      if (!tagToAdd || typeof tagToAdd !== 'string') return;
      const newTag = tagToAdd.trim();
      if (newTag && !tags.includes(newTag)) {
          setTags([...tags, newTag]);
      }
      setQuery('');
    };
  
    const removeTag = (indexToRemove: number) => {
      setTags(tags.filter((_, index) => index !== indexToRemove));
    };
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const customValue = query.trim();
  
      if (e.key === 'Enter' && customValue) {
        const isSuggestionSelected = filteredSuggestions.some(
          (suggestion) => suggestion.name.toLowerCase() === customValue.toLowerCase()
        );
  
        if (!isSuggestionSelected) {
          e.preventDefault();
          addTag(customValue);
        }
      }
      
      if (e.key === 'Tab' && customValue && filteredSuggestions.length > 0) {
        e.preventDefault();
        addTag(filteredSuggestions[0].name);
      }
    };
  
  return (
    <div>
        <div className="flex flex-wrap items-center gap-2 bg-[var(--color-bg-tertiary)] border border-transparent rounded-md p-2 mb-2 min-h-[44px]">
            <AnimatePresence>
                {tags.map((tag, index) => (
                    <motion.div
                        key={tag}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="flex items-center gap-1.5 bg-[var(--color-bg-primary)] text-[var(--color-accent-primary)] font-medium py-1 pl-3 pr-2 rounded-full text-sm"
                    >
                        <span>{tag}</span>
                        <button onClick={() => removeTag(index)} className="text-[var(--color-text-muted)] hover:text-white rounded-full hover:bg-red-500/50 w-4 h-4 flex items-center justify-center">
                            ×
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
        
        <Combobox value={query} onChange={addTag} nullable>
            <div className="relative">
                <div className="relative w-full cursor-default overflow-hidden rounded-md bg-[var(--color-bg-tertiary)] text-left border border-transparent focus-within:border-[var(--color-accent-primary)]">
                    <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 bg-transparent text-[var(--color-text-primary)] focus:ring-0"
                        placeholder={placeholder}
                        onChange={(event) => setQuery(event.target.value.replace(/['",]/g, ''))}
                        onKeyDown={handleKeyDown}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </Combobox.Button>
                </div>
                <AnimatePresence>
                    {filteredSuggestions.length > 0 && (
                        <Combobox.Options 
                            as={motion.div}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[var(--color-bg-secondary)] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10"
                        >
                           {Object.entries(groupedSuggestions).map(([category, suggestions]) => (
                                <div key={category}>
                                    {suggestions.length > 0 && (
                                        <div className="px-4 py-1 text-xs font-bold uppercase text-[var(--color-text-muted)]">
                                            {category}
                                        </div>
                                    )}
                                    {suggestions.map((suggestion) => (
                                        <Combobox.Option
                                            key={suggestion.name}
                                            value={suggestion.name}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                    active ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' : 'text-[var(--color-text-primary)]'
                                                }`
                                            }
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                        {suggestion.name}
                                                    </span>
                                                    {selected && (
                                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-accent-primary)]`}>
                                                            <Check className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </Combobox.Option>
                                    ))}
                                </div>
                            ))}
                        </Combobox.Options>
                    )}
                </AnimatePresence>
            </div>
        </Combobox>
    </div>
  );
}