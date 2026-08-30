// src/app/api/update-content/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PageData } from '@/components/PortfolioLayout';

export async function POST(request: Request) {
  try {
    const data: PageData = await request.json();
    const contentDirectory = path.join(process.cwd(), 'src/content');

    // Destructure the data for easier handling
    const { settingsData, headerData, aboutData, experienceData, educationData, projectsData, skillsData } = data;

    // --- Write settings.md ---
    const settingsFileContents = matter.stringify('', settingsData);
    fs.writeFileSync(path.join(contentDirectory, 'settings.md'), settingsFileContents);

    // --- Write header.md ---
    const headerFileContents = matter.stringify('', headerData);
    fs.writeFileSync(path.join(contentDirectory, 'header.md'), headerFileContents);

    // --- Write about.md ---
    const aboutFileContents = matter.stringify(aboutData.markdownContent, {
      highlightKeywords: aboutData.highlightKeywords,
      currentlyLearning: aboutData.currentlyLearning,
    });
    fs.writeFileSync(path.join(contentDirectory, 'about.md'), aboutFileContents);

    // --- Write experience.md ---
    const experienceFileContents = matter.stringify('', { jobs: experienceData.jobs });
    fs.writeFileSync(path.join(contentDirectory, 'experience.md'), experienceFileContents);

    // --- Write education.md ---
    const educationFileContents = matter.stringify('', { degrees: educationData.degrees });
    fs.writeFileSync(path.join(contentDirectory, 'education.md'), educationFileContents);
    
    // --- Write projects.md ---
    const projectsFileContents = matter.stringify('', { projects: projectsData.projects });
    fs.writeFileSync(path.join(contentDirectory, 'projects.md'), projectsFileContents);

    // --- Write skills.md ---
    const skillsFileContents = matter.stringify('', { skillCategories: skillsData.skillCategories });
    fs.writeFileSync(path.join(contentDirectory, 'skills.md'), skillsFileContents);

    return NextResponse.json({ message: 'Content updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update content', details: errorMessage }, { status: 500 });
  }
}