// src/components/PortfolioLayout.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Education from '@/components/Education';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Socials from '@/components/Socials';
import DownloadCV from '@/components/DownloadCV';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// Type Definitions
export type SettingsData = {
  // Metadata
  metaTitle?: string;
  metaDescription?: string;
  // Socials
  github?: string;
  linkedin?: string;
  x?: string;
  email?: string;
  // Assets
  profileImage?: string;
  cvPdf?: string;
  favicon?: string;
  // Appearance
  showExperience?: boolean;
  showProjects?: boolean;
  defaultTheme?: string;
  fontPair?: 'geist' | 'lato';
  leftColumnSections?: string[];
  rightColumnSections?: string[];
};

export type DateValue = { year: number | null; month: number | null; };
export type Project = { name: string; link?: string; github?: string; tech: string[]; description:string[]; };
export type Job = { role: string; company: string; period: { start: DateValue; end: DateValue | 'Present' }; description: string[]; };
export type Degree = { degree: string; institution: string; location: string; period: { start: DateValue; end: DateValue | 'Present' }; };
export type SkillCategory = { name: string; skills: string[]; };

export type PageData = {
  settingsData: SettingsData;
  headerData: { name: string; title: string; tagline: string; };
  aboutData: {
    contentHtml: string;
    markdownContent: string;
    highlightKeywords: string[];
    currentlyLearning: string[];
  };
  experienceData: { jobs: Job[] };
  educationData: { degrees: Degree[] };
  skillsData: { skillCategories: SkillCategory[] };
  projectsData: { projects: Project[] };
};

type SectionRefs = {
    [key: string]: React.RefObject<HTMLDivElement | null>;
};

const SectionComponent = ({ sectionId, data }: { sectionId: string, data: PageData }) => {
  switch (sectionId) {
      case 'about': return <About contentHtml={data.aboutData.contentHtml} learning={data.aboutData.currentlyLearning} keywords={data.aboutData.highlightKeywords} />;
      case 'education': return <Education degrees={data.educationData.degrees} />;
      case 'skills': return <Skills categories={data.skillsData.skillCategories} />;
      case 'experience': return <Experience jobs={data.experienceData.jobs} />;
      case 'projects': return <Projects projects={data.projectsData.projects} />;
      default: return null;
  }
};

// This is the main layout component. It's a pure UI component that just renders data.
export default function PortfolioLayout({ 
  data, 
  isLoading,
  sectionRefs = {},
  showDragHandle = false
}: { 
  data: PageData, 
  isLoading: boolean,
  sectionRefs?: SectionRefs,
  showDragHandle?: boolean
}) {
  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { settingsData, headerData } = data;
  const leftSections = settingsData.leftColumnSections || ['about', 'education', 'skills'];
  const rightSections = settingsData.rightColumnSections || ['experience', 'projects'];

  // In Edit Mode, it only adds padding. In Public Mode, it adds max-width and centering.
  const containerClasses = showDragHandle
  ? "px-6 pt-8 pb-12 md:px-12 md:pt-16 md:pb-20" 
  : "mx-auto max-w-screen-xl px-6 pt-8 pb-12 md:px-12 md:pt-16 md:pb-20";

  return (
    <main className={containerClasses}>

            {/* Header Section */}
            <header ref={sectionRefs['header']} className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between lg:items-start mb-8">
                <div className="flex items-center gap-4">
                    <Image src={settingsData.profileImage || '/profile.jpg'} alt="Profile Picture" width={80} height={80} className="w-20 h-20 rounded-full object-cover" priority />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">{headerData.name}</h1>
                        <h2 className="mt-1 text-md font-medium tracking-tight text-[var(--color-text-secondary)]">{headerData.title}</h2>
                        <p className="mt-2 max-w-xs text-sm leading-normal text-[var(--color-text-muted)]">{headerData.tagline}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <Socials settings={settingsData} />
                    <DownloadCV cvPath={settingsData.cvPdf || ''} />
                </div>
            </header>
            
            <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-8 lg:items-start">

                {/* Left Section */}
                <SortableContext items={leftSections} strategy={verticalListSortingStrategy}>
                    <aside className="mt-8 lg:mt-0 lg:w-1/3 flex flex-col gap-8 order-2 lg:order-1">
                        {leftSections.map(sectionId => (
                            <div ref={sectionRefs[sectionId]} key={sectionId}>
                                <SortableItem id={sectionId} showDragHandle={showDragHandle}>
                                    <SectionComponent sectionId={sectionId} data={data} />
                                </SortableItem>
                            </div>
                        ))}
                         <ThemeSwitcher />
                    </aside>
                </SortableContext>
                
                {/* Right Section */}
                <SortableContext items={rightSections} strategy={verticalListSortingStrategy}>
                    <section className="lg:w-2/3 flex flex-col gap-8 order-1 lg:order-2">
                        {rightSections.map(sectionId => (
                            <div ref={sectionRefs[sectionId]} key={sectionId}>
                                <SortableItem id={sectionId} showDragHandle={showDragHandle}>
                                    <SectionComponent sectionId={sectionId} data={data} />
                                </SortableItem>
                            </div>
                        ))}
                    </section>
                </SortableContext>

            </div>
        </main>
    );
}