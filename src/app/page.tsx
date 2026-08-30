// src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import PortfolioLayout, { PageData } from '@/components/PortfolioLayout';

const initialDataState: PageData = {
  settingsData: {
    showExperience: true,
    showProjects: true,
  },
  headerData: { name: "", title: "", tagline: "" },
  aboutData: {
    contentHtml: "",
    markdownContent: "",
    highlightKeywords: [],
    currentlyLearning: []
  },
  experienceData: { jobs: [] },
  educationData: { degrees: [] },
skillsData: { skillCategories: [] },
  projectsData: { projects: [] },
};

export default function Home() {
  const [data, setData] = useState<PageData>(initialDataState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [settings, header, about, experience, education, skills, projects] = await Promise.all([
          fetch('/api/content?file=settings').then(res => res.json()),
          fetch('/api/content?file=header').then(res => res.json()),
          fetch('/api/content?file=about').then(res => res.json()),
          fetch('/api/content?file=experience').then(res => res.json()),
          fetch('/api/content?file=education').then(res => res.json()),
          fetch('/api/content?file=skills').then(res => res.json()),
          fetch('/api/content?file=projects').then(res => res.json()),
        ]);
        setData({
          settingsData: settings,
          headerData: header,
          aboutData: about,
          experienceData: experience,
          educationData: education,
          skillsData: skills,
          projectsData: projects,
        });
      } catch (error) {
        console.error("Failed to fetch page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return (
    <>
      <PortfolioLayout data={data} isLoading={isLoading} />
    </>
  );
}