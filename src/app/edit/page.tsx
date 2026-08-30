// src/app/edit/page.tsx
"use client";

import { useState, useEffect, useRef, createRef } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { sortPeriodsDescending } from '@/lib/utils';
import AdvancedDateComponent from '@/components/AdvancedDateComponent';
import ConfirmationModal from '@/components/ConfirmationModal';
import EmptyState from '@/components/EmptyState';
import PortfolioLayout, { PageData, SettingsData, DateValue } from '@/components/PortfolioLayout';
import { useTheme } from '@/components/ThemeProvider';
import SmartTagInput from '@/components/SmartTagInput';
import { remark } from 'remark';
import html from 'remark-html';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/SortableItem';


// --- ICONS FROM LUCIDE-REACT ---
import {
    UserCircle, FileText, Briefcase, FolderKanban, GraduationCap, Sparkles, SlidersHorizontal, PlusCircle, Trash2, Save, Undo2, DownloadCloud
} from 'lucide-react';
// import { div } from 'framer-motion/client';

// --- HELPER FUNCTIONS & COMPONENTS ---
// This used to strip every apostrophe, to dodge quoting problems when the value
// is written back out as YAML front matter. gray-matter (js-yaml) already
// quotes and escapes correctly, so all the stripping did was corrupt the user's
// own text: "I'm a developer" was saved as "Im a developer". Kept as the single
// place to normalise field input; it no longer removes characters.
const sanitize = (str: string) => str;

function AutoResizingTextarea({ 
    singleLine = false, 
    ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { singleLine?: boolean }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [props.value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // If singleLine is true and the user presses Enter, prevent the newline.
        if (singleLine && e.key === 'Enter') {
            e.preventDefault();
        }
        // If the parent component has its own onKeyDown, we still call it.
        if (props.onKeyDown) {
            props.onKeyDown(e);
        }
    };

    return <textarea ref={textareaRef} onKeyDown={handleKeyDown} {...props} rows={1} />;
}




// --- EDITOR COMPONENTS ---

function HeaderEditor({ data, setData }: { data: PageData['headerData'], setData: (d: PageData['headerData']) => void }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Header Details</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Name</label>
                    <AutoResizingTextarea singleLine value={data.name} onChange={e => setData({ ...data, name: sanitize(e.target.value) })} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md resize-none overflow-hidden" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Title / Subheading</label>
                    <AutoResizingTextarea singleLine value={data.title} onChange={e => setData({ ...data, title: sanitize(e.target.value) })} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md resize-none overflow-hidden" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Tagline</label>
                    <AutoResizingTextarea singleLine value={data.tagline} onChange={e => setData({ ...data, tagline: sanitize(e.target.value) })} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md resize-none overflow-hidden" />
                </div>
            </div>
        </div>
    );
}

function AddItemButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
    return (
        <button onClick={onClick} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[var(--color-border-primary)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] py-3 rounded-lg transition-colors">
            <PlusCircle size={18} />
            <span className="font-semibold">{children}</span>
        </button>
    );
}

function AboutEditor({ data, setData }: { data: PageData['aboutData'], setData: (d: PageData['aboutData']) => void }) {
    const handleMarkdownChange = async (md: string) => {
        const sanitizedMd = sanitize(md);
        const processedHtml = await remark().use(html).process(sanitizedMd);
        setData({
            ...data,
            markdownContent: sanitizedMd,
            contentHtml: processedHtml.toString(),
        });
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">About Section</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Main Content (Markdown supported)</label>
                    <AutoResizingTextarea
                        value={data.markdownContent}
                        onChange={e => handleMarkdownChange(e.target.value)}
                        rows={5} 
                        className="w-full bg-[var(--color-bg-tertiary)] border border-transparent rounded-md p-2 focus:border-[var(--color-accent-primary)] focus:ring-0 transition-colors resize-none overflow-hidden"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Highlighted Keywords</label>
                    <SmartTagInput tags={data.highlightKeywords} setTags={(tags) => setData({ ...data, highlightKeywords: tags })} placeholder="Add a keyword..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Currently Learning</label>
                    <SmartTagInput tags={data.currentlyLearning} setTags={(tags) => setData({ ...data, currentlyLearning: tags })} placeholder="Add a topic..." />
                </div>
            </div>
        </div>
    );
}

function BulletPointEditor({ points, onPointChange, onPointAdd, onPointRemove }: {
    points: string[],
    onPointChange: (pointIndex: number, value: string) => void,
    onPointAdd: () => void,
    onPointRemove: (pointIndex: number) => void
}) {
    return (
        <div className="space-y-2">
            {points.map((point, pointIndex) => (
                <div key={pointIndex} className="flex items-center gap-2">
                    <AutoResizingTextarea
                        singleLine
                        value={point}
                        onChange={e => onPointChange(pointIndex, e.target.value)}
                        className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md resize-none overflow-hidden"
                    />
                    <button onClick={() => onPointRemove(pointIndex)} className="text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-full p-1.5 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            <button onClick={onPointAdd} className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors py-1">
                <PlusCircle size={16} />
                <span>Add Bullet Point</span>
            </button>
        </div>
    );
}

type FieldValue = string | { start: DateValue; end: DateValue | 'Present' };

function ExperienceEditor({ data, setData }: { data: PageData['experienceData'], setData: (d: PageData['experienceData']) => void }) {
    const createDefaultPeriod = () => ({
        start: { year: null, month: null } as DateValue,
        end: { year: null, month: null } as DateValue | 'Present'
    });

    const updateJobs = (newJobs: PageData['experienceData']['jobs']) => setData({ jobs: newJobs });
    const addJob = () => updateJobs([...data.jobs, { role: '', company: '', period: createDefaultPeriod(), description: [''] }]);    
    const removeJob = (index: number) => updateJobs(data.jobs.filter((_, i) => i !== index));

    const handleJobFieldChange = (jobIndex: number, field: string, value: FieldValue) => {
        const newJobs = [...data.jobs];
        newJobs[jobIndex] = { ...newJobs[jobIndex], [field]: typeof value === 'string' ? sanitize(value) : value };
        updateJobs(newJobs);
    };

    const handleDescriptionChange = (jobIndex: number, pointIndex: number, value: string) => {
        const newJobs = [...data.jobs];
        newJobs[jobIndex].description[pointIndex] = sanitize(value);
        updateJobs(newJobs);
    };

    const addDescriptionPoint = (jobIndex: number) => {
        const newJobs = [...data.jobs];
        newJobs[jobIndex].description.push('');
        updateJobs(newJobs);
    };

    const removeDescriptionPoint = (jobIndex: number, pointIndex: number) => {
        const newJobs = [...data.jobs];
        newJobs[jobIndex].description = newJobs[jobIndex].description.filter((_, i) => i !== pointIndex);
        updateJobs(newJobs);
    };

    const jobIndexMap = new Map(data.jobs.map((job, index) => [job, index]));
    const sortedJobs = [...data.jobs].sort((a, b) => {
        // Defensive check in case data is malformed
        if (typeof a.period !== 'object' || typeof b.period !== 'object') return 0;
        return sortPeriodsDescending(a.period, b.period);
    });

    if (data.jobs.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Work Experience</h2>
                <EmptyState
                    Icon={Briefcase}
                    title="No work experience added"
                    description="Get started by adding your first professional role."
                    buttonText="Add Your First Job"
                    onButtonClick={addJob}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Work Experience</h2>
            {sortedJobs.map((job) => {
                const originalIndex = jobIndexMap.get(job)!;
                return (
                    <SortableItem key={`job-${originalIndex}`} id={`job-${originalIndex}`} showDragHandle={true}>
                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg space-y-4 border border-transparent hover:border-[var(--color-border-primary)] transition-colors relative group w-full">
                            <button onClick={() => removeJob(originalIndex)} className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                <Trash2 size={20} />
                            </button>
                            <AutoResizingTextarea singleLine placeholder="Role" value={job.role} onChange={e => handleJobFieldChange(originalIndex, 'role', e.target.value)} className="w-full bg-[var(--color-bg-primary)] p-2 rounded-md" />
                            <AutoResizingTextarea singleLine placeholder="Company" value={job.company} onChange={e => handleJobFieldChange(originalIndex, 'company', e.target.value)} className="w-full bg-[var(--color-bg-primary)] p-2 rounded-md" />

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Period</label>
                                <AdvancedDateComponent
                                    startDate={job.period.start}
                                    endDate={job.period.end}
                                    onDateChange={(start, end) => handleJobFieldChange(originalIndex, 'period', { start, end })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Description</label>
                                <BulletPointEditor points={job.description} onPointChange={(pIndex, val) => handleDescriptionChange(originalIndex, pIndex, val)} onPointAdd={() => addDescriptionPoint(originalIndex)} onPointRemove={(pIndex) => removeDescriptionPoint(originalIndex, pIndex)} />
                            </div>
                        </div>
                    </SortableItem>
                );
            })}
            <AddItemButton onClick={addJob}>Add Experience</AddItemButton>
        </div>
    );
}


function ProjectsEditor({ data, setData }: { data: PageData['projectsData'], setData: (d: PageData['projectsData']) => void }) {
    const updateProjects = (newProjects: PageData['projectsData']['projects']) => setData({ projects: newProjects });
    const addProject = () => updateProjects([...data.projects, { name: '', link: '', github: '', tech: [], description: [''] }]);
    const removeProject = (index: number) => updateProjects(data.projects.filter((_, i) => i !== index));

    const handleProjectFieldChange = (projIndex: number, field: string, value: string | string[]) => {
        const newProjects = [...data.projects];
        newProjects[projIndex] = { ...newProjects[projIndex], [field]: Array.isArray(value) ? value : sanitize(value) };
        updateProjects(newProjects);
    };

    const handleDescriptionChange = (projIndex: number, pointIndex: number, value: string) => {
        const newProjects = [...data.projects];
        newProjects[projIndex].description[pointIndex] = sanitize(value);
        updateProjects(newProjects);
    };

    const addDescriptionPoint = (projIndex: number) => {
        const newProjects = [...data.projects];
        newProjects[projIndex].description.push('');
        updateProjects(newProjects);
    };

    const removeDescriptionPoint = (projIndex: number, pointIndex: number) => {
        const newProjects = [...data.projects];
        newProjects[projIndex].description = newProjects[projIndex].description.filter((_, i) => i !== pointIndex);
        updateProjects(newProjects);
    };

    if (data.projects.length === 0) {
        return (
           <div className="space-y-6">
               <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Projects</h2>
               <EmptyState
                   Icon={FolderKanban}
                   title="No projects added"
                   description="Showcase your work by adding your first project."
                   buttonText="Add Your First Project"
                   onButtonClick={addProject}
               />
           </div>
       );
   }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Projects</h2>
            {data.projects.map((project, projIndex) => (
                <SortableItem key={`project-${projIndex}`} id={`project-${projIndex}`} showDragHandle={true}>
                    <div className="bg-[var(--color-bg-secondary)] p-1 rounded-lg space-y-4 border border-transparent hover:border-[var(--color-border-primary)] transition-colors relative group w-full">
                        <button onClick={() => removeProject(projIndex)} className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <Trash2 size={20} />
                        </button>
                        <AutoResizingTextarea singleLine placeholder="Project Name" value={project.name} onChange={e => handleProjectFieldChange(projIndex, 'name', e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md" />
                        <AutoResizingTextarea singleLine placeholder="Live Link" value={project.link || ''} onChange={e => handleProjectFieldChange(projIndex, 'link', e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md" />
                        <AutoResizingTextarea singleLine placeholder="GitHub Link" value={project.github || ''} onChange={e => handleProjectFieldChange(projIndex, 'github', e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md" />
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Tech Stack</label>
                            <SmartTagInput tags={project.tech} setTags={(tags) => handleProjectFieldChange(projIndex, 'tech', tags)} placeholder="Add tech..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Description</label>
                            <BulletPointEditor points={project.description} onPointChange={(pIndex, val) => handleDescriptionChange(projIndex, pIndex, val)} onPointAdd={() => addDescriptionPoint(projIndex)} onPointRemove={(pIndex) => removeDescriptionPoint(projIndex, pIndex)} />
                        </div>
                    </div>
                </SortableItem>
            ))}
            <AddItemButton onClick={addProject}>Add Project</AddItemButton>
        </div>
    );
}

function SkillsEditor({ data, setData }: { data: PageData['skillsData'], setData: (d: PageData['skillsData']) => void }) {
    const updateCategories = (newCategories: PageData['skillsData']['skillCategories']) => setData({ skillCategories: newCategories });
    const addCategory = () => updateCategories([...data.skillCategories, { name: 'New Category', skills: [] }]);
    const removeCategory = (index: number) => updateCategories(data.skillCategories.filter((_, i) => i !== index));

    const handleCategoryNameChange = (index: number, value: string) => {
        const newCategories = [...data.skillCategories];
        newCategories[index].name = sanitize(value);
        updateCategories(newCategories);
    };

    const handleSkillsChange = (index: number, tags: string[]) => {
        const newCategories = [...data.skillCategories];
        newCategories[index].skills = tags;
        updateCategories(newCategories);
    };

    if (data.skillCategories.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Skills</h2>
                <EmptyState
                    Icon={Sparkles}
                    title="No skill categories added"
                    description="Group your skills into categories like 'Languages' or 'Technologies'."
                    buttonText="Add Your First Category"
                    onButtonClick={addCategory}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Skills</h2>
            {data.skillCategories.map((category, index) => (
                <SortableItem key={`skillcat-${index}`} id={`skillcat-${index}`} showDragHandle={true}>
                    <div className="bg-[var(--color-bg-secondary)] p-1.25 rounded-lg space-y-4 border border-transparent hover:border-[var(--color-border-primary)] transition-colors relative group w-full">
                        <button onClick={() => removeCategory(index)} className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <Trash2 size={20} />
                        </button>
                        <AutoResizingTextarea singleLine placeholder="Category Name" value={category.name} onChange={e => handleCategoryNameChange(index, e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md" />
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Skills</label>
                            <SmartTagInput tags={category.skills} setTags={(tags) => handleSkillsChange(index, tags)} placeholder="Add a skill..." />
                        </div>
                    </div>
                </SortableItem>
            ))}
            <AddItemButton onClick={addCategory}>Add Category</AddItemButton>
        </div>
    );
}

function EducationEditor({ data, setData }: { data: PageData['educationData'], setData: (d: PageData['educationData']) => void }) {

    const createDefaultPeriod = () => ({
        start: { year: null, month: null } as DateValue,
        end: { year: null, month: null } as DateValue | 'Present'
    });
    
    const updateDegrees = (newDegrees: PageData['educationData']['degrees']) => setData({ degrees: newDegrees });
    const addDegree = () => updateDegrees([...data.degrees, { degree: '', institution: '', location: '', period: createDefaultPeriod() }]);
    const removeDegree = (index: number) => updateDegrees(data.degrees.filter((_, i) => i !== index));

    const handleDegreeChange = (index: number, field: string, value: FieldValue) => {
        const newDegrees = [...data.degrees];
        newDegrees[index] = { ...newDegrees[index], [field]: typeof value === 'string' ? sanitize(value) : value };
        updateDegrees(newDegrees);
    };

    const degreeIndexMap = new Map(data.degrees.map((degree, index) => [degree, index]));
    const sortedDegrees = [...data.degrees].sort((a, b) => {
        if (typeof a.period !== 'object' || typeof b.period !== 'object') return 0;
        return sortPeriodsDescending(a.period, b.period);
    });

    if (data.degrees.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Education</h2>
                <EmptyState
                    Icon={GraduationCap}
                    title="No education history added"
                    description="List your degrees and qualifications."
                    buttonText="Add Your First Degree"
                    onButtonClick={addDegree}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Education</h2>
            {sortedDegrees.map((degree) => {
                const originalIndex = degreeIndexMap.get(degree)!;
                return (
                    <SortableItem key={`degree-${originalIndex}`} id={`degree-${originalIndex}`} showDragHandle={true}>
                        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg space-y-4 border border-transparent hover:border-[var(--color-border-primary)] transition-colors relative group w-full">
                            <button onClick={() => removeDegree(originalIndex)} className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                <Trash2 size={20} />
                            </button>
                            <AutoResizingTextarea singleLine placeholder="Degree" value={degree.degree} onChange={e => handleDegreeChange(originalIndex, 'degree', e.target.value)} className="w-full bg-[var(--color-bg-primary)] p-2 rounded-md" />
                            <AutoResizingTextarea singleLine placeholder="Institution" value={degree.institution} onChange={e => handleDegreeChange(originalIndex, 'institution', e.target.value)} className="w-full bg-[var(--color-bg-primary)] p-2 rounded-md" />
                            <AutoResizingTextarea singleLine placeholder="Location" value={degree.location} onChange={e => handleDegreeChange(originalIndex, 'location', e.target.value)} className="w-full bg-[var(--color-bg-primary)] p-2 rounded-md" />
                            
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Period</label>
                                <AdvancedDateComponent
                                    startDate={degree.period.start}
                                    endDate={degree.period.end}
                                    onDateChange={(start, end) => handleDegreeChange(originalIndex, 'period', { start, end })}
                                />
                            </div>
                        </div>
                    </SortableItem>
                );
            })}
            <AddItemButton onClick={addDegree}>Add Degree</AddItemButton>
        </div>
    );
}

// --- TOGGLE COMPONENT ---
function ToggleSwitch({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean) => void }) {
    return (
        <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
                <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-[var(--color-accent-solid)]' : 'bg-[var(--color-bg-tertiary)]'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
            </div>
        </label>
    );
}

// --- THEME LIST ---
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

// --- SETTINGS EDITOR ---
  function SettingsEditor({ data, setData, setTheme }: { data: SettingsData, setData: (d: SettingsData) => void, setTheme: (t: string) => void }) {
    const [activeTab, setActiveTab] = useState('General');
    const [isUploading, setIsUploading] = useState<string | null>(null);

    // --- State for Image Cropping ---
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    // --- State for Favicon Preview ---
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

    useEffect(() => {
        if (data.favicon) {
            const cleanPath = data.favicon.split('?')[0];
            setFaviconPreview(`${cleanPath}?t=${new Date().getTime()}`);
        }
    }, [data.favicon]);


    const handleFieldChange = (field: keyof SettingsData, value: string | boolean) => {
        setData({ ...data, [field]: value });
    };

    const handleThemeChange = (themeValue: string) => {
        handleFieldChange('defaultTheme', themeValue);
        setTheme(themeValue);
    };

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, uploadType: 'profile' | 'favicon' | 'cv') => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        if (uploadType === 'profile') {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(file);
        } else if (uploadType === 'favicon') {
            const reader = new FileReader();
            reader.addEventListener('load', () => setFaviconPreview(reader.result?.toString() || null));
            reader.readAsDataURL(file);
            handleFileUpload(file, 'favicon');
        } else {
            handleFileUpload(file, 'cv');
        }
    };

    const handleFileUpload = async (file: File, uploadType: 'cv' | 'favicon') => {
        setIsUploading(uploadType);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploadType', uploadType);

        try {
            const response = await fetch('/api/upload-file', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            
            const newPath = result.filePath;
            if (uploadType === 'cv') setData({ ...data, cvPdf: newPath });
            else if (uploadType === 'favicon') setData({ ...data, favicon: newPath });

        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('File upload failed.');
        } finally {
            setIsUploading(null);
        }
    };

    // Function to generate the cropped image and upload it
    const handleCropAndUpload = async () => {
        if (!completedCrop || !previewCanvasRef.current || !imgRef.current) return;
        
        const canvas = previewCanvasRef.current;
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        
        ctx.drawImage(image, cropX, cropY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, completedCrop.width, completedCrop.height);

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            setIsUploading('profile');
            const formData = new FormData();
            formData.append('file', blob, 'profile.jpg');
            formData.append('uploadType', 'profile');

            try {
                const response = await fetch('/api/upload-file', { method: 'POST', body: formData });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                
                setData({ ...data, profileImage: result.filePath });
                setImgSrc('');
            } catch (error) {
                console.error('Crop and Upload failed:', error);
                toast.error('Crop and upload failed.');
            } finally {
                setIsUploading(null);
            }
        }, 'image/jpeg');
    };

    const tabs = ['General', 'Socials', 'Appearance', 'Assets', 'Export'];

    return (
        <div>
            {/* --- CROP MODAL --- */}
            {imgSrc && (
                <div className="fixed inset-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[var(--color-bg-secondary)] p-6 rounded-lg shadow-2xl space-y-4 w-full max-w-lg">
                        <h2 className="text-xl font-bold">Crop Your Profile Picture</h2>
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img ref={imgRef} src={imgSrc} alt="Profile preview for cropping" style={{ maxHeight: '70vh' }} />
                        </ReactCrop>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setImgSrc('')} className="py-2 px-4 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]">Cancel</button>
                            <button onClick={handleCropAndUpload} className="py-2 px-4 rounded-md bg-[var(--color-accent-solid)] text-white hover:bg-[var(--color-accent-solid-hover)]">
                                {isUploading === 'profile' ? 'Uploading...' : 'Confirm & Upload'}
                            </button>
                        </div>
                    </div>
                    <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
                </div>
            )}
            {/* Tab Navigation */}
            <div className="space-y-6">
             <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Site Settings</h2>
                <div className="border-b border-[var(--color-border-primary)]">
                    <nav className="-mb-px flex space-x-6">

                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm
                                    ${activeTab === tab 
                                        ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                                        : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`
                                }
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            {/* Tab Content */}
            <div className="space-y-6 mt-6">
                {activeTab === 'General' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Site Metadata</h3>
                        <AutoResizingTextarea singleLine placeholder="Site Title" value={data.metaTitle || ''} onChange={e => handleFieldChange('metaTitle', e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md resize-none overflow-hidden" />
                        <AutoResizingTextarea placeholder="Site Description" value={data.metaDescription || ''} onChange={e => handleFieldChange('metaDescription', e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md" />
                    </div>
                )}
                {activeTab === 'Socials' && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold">Social Links</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">Provide your usernames. The correct links will be generated automatically.</p>
                        
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">GitHub</label>
                            <AutoResizingTextarea singleLine placeholder="yourusername" value={data.github || ''} onChange={e => handleFieldChange('github', e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md resize-none overflow-hidden" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">LinkedIn</label>
                            <AutoResizingTextarea singleLine placeholder="yourusername" value={data.linkedin || ''} onChange={e => handleFieldChange('linkedin', e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md resize-none overflow-hidden" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">X (formerly Twitter)</label>
                            <AutoResizingTextarea singleLine placeholder="yourusername" value={data.x || ''} onChange={e => handleFieldChange('x', e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md resize-none overflow-hidden" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">E-mail</label>
                             <AutoResizingTextarea singleLine placeholder="your.email@example.com" value={data.email || ''} onChange={e => handleFieldChange('email', e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] p-2 rounded-md resize-none overflow-hidden" />
                        </div>
                    </div>
                )}

                {activeTab === 'Appearance' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold">Default Theme</h3>
                             <select value={data.defaultTheme || 'dark-slate'} onChange={(e) => handleThemeChange(e.target.value)} className="w-full appearance-none bg-[var(--color-bg-tertiary)] p-2 rounded-md">
                                {themes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Fonts</h3>
                            <select value={data.fontPair || 'geist'} onChange={(e) => handleFieldChange('fontPair', e.target.value)} className="w-full appearance-none bg-[var(--color-bg-tertiary)] p-2 rounded-md">
                                <option value="geist">Geist (Sans-serif)</option>
                                <option value="lato">Lato (Sans-serif)</option>
                            </select>
                        </div>
                         <div>
                            <h3 className="text-lg font-bold">Section Visibility</h3>
                            <div className="space-y-2 bg-[var(--color-bg-tertiary)] p-4 rounded-md">
                                <ToggleSwitch label="Show Experience Section" checked={data.showExperience ?? true} onChange={(c) => handleFieldChange('showExperience', c)} />
                                <ToggleSwitch label="Show Projects Section" checked={data.showProjects ?? true} onChange={(c) => handleFieldChange('showProjects', c)} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Assets' && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold">Site Assets</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Profile Picture</label>
                            <input type="file" accept="image/jpeg, image/png" onChange={(e) => onSelectFile(e, 'profile')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-[var(--color-bg-tertiary)] file:text-[var(--color-text-primary)] hover:file:bg-[var(--color-accent-solid)]"/>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Supported: JPG, PNG. Opens a crop tool.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">CV / Resume</label>
                            <input type="file" accept=".pdf" onChange={(e) => onSelectFile(e, 'cv')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-[var(--color-bg-tertiary)] file:text-[var(--color-text-primary)] hover:file:bg-[var(--color-accent-solid)]"/>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Supported: PDF. Will be renamed to cv.pdf.</p>
                            {isUploading === 'cv' && <p>Uploading...</p>}
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="flex-grow">
                                <label className="block text-sm font-medium mb-1">Favicon</label>
                                <input type="file" accept="image/x-icon, image/png" onChange={(e) => onSelectFile(e, 'favicon')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-[var(--color-bg-tertiary)] file:text-[var(--color-text-primary)] hover:file:bg-[var(--color-accent-solid)]"/>
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">Supported: ICO, PNG. Will be renamed to favicon.ico.</p>
                                {isUploading === 'favicon' && <p>Uploading...</p>}
                            </div>
                            {faviconPreview && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={faviconPreview} src={faviconPreview} alt="Favicon Preview" className="w-8 h-8 rounded-md" />
                                )}
                        </div>
                    </div>
                )}
            </div>
            {/* --- "Export" Tab --- */}
            {activeTab === 'Export' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Export Project</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Click the button below to download a clean, production-ready ZIP file of your portfolio.
                            This version will not include the editor code, making it lightweight and ready for deployment.
                        </p>
                        <a 
                            href="/api/download-zip" 
                            download="my-portfolio.zip"
                            className="inline-flex items-center justify-center gap-2 w-full bg-[var(--color-accent-solid)] hover:bg-[var(--color-accent-solid-hover)] text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
                        >
                            <DownloadCloud size={18} />
                            Download Project ZIP
                        </a>
                    </div>
                )}
            </div>
    );
}



// --- MAIN PAGE COMPONENT ---

const initialDataState: PageData = {
    settingsData: {
        showExperience: true,
        showProjects: true,
    },
    headerData: { name: "", title: "", tagline: "" },
    aboutData: { contentHtml: "", markdownContent: "", highlightKeywords: [], currentlyLearning: [] },
    experienceData: { jobs: [] },
    educationData: { degrees: [] },
    skillsData: { skillCategories: [] },
    projectsData: { projects: [] },
};

export default function EditPage() {
    const [draftData, setDraftData] = useState<PageData>(initialDataState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('Header');
    const { setTheme } = useTheme();

    const sections = [
        { name: 'Header', icon: UserCircle, id: 'header' },
        { name: 'About', icon: FileText, id: 'about' },
        { name: 'Experience', icon: Briefcase, id: 'experience' },
        { name: 'Projects', icon: FolderKanban, id: 'projects' },
        { name: 'Education', icon: GraduationCap, id: 'education' },
        { name: 'Skills', icon: Sparkles, id: 'skills' },
        { name: 'Settings', icon: SlidersHorizontal, id: 'settings' },
    ];

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
            setDraftData({
                settingsData: settings, headerData: header, aboutData: about, 
                experienceData: experience, educationData: education, 
                skillsData: skills, projectsData: projects
            });
            toast.success("Loaded latest saved data!");
        } catch (error) {
            console.error("Failed to fetch page data:", error);
            toast.error("Failed to load data.");
        }
    };

    const sectionRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});
    sections.forEach(section => {
        sectionRefs.current[section.id] = createRef<HTMLDivElement>();
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- DRAG-END HANDLER ---
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();
        
        const isSection = sections.some(s => s.id === activeId);

        if (isSection) {
            setDraftData(prev => {
                const { leftColumnSections = [], rightColumnSections = [] } = prev.settingsData;
                const activeContainer = leftColumnSections.includes(activeId) ? 'left' : 'right';
                const overContainer = leftColumnSections.includes(overId) ? 'left' : 'right';

                let newLeft = [...leftColumnSections];
                let newRight = [...rightColumnSections];

                if (activeContainer === overContainer) {
                    // Reordering within the same column
                    if (activeContainer === 'left') {
                        newLeft = arrayMove(newLeft, newLeft.indexOf(activeId), newLeft.indexOf(overId));
                    } else {
                        newRight = arrayMove(newRight, newRight.indexOf(activeId), newRight.indexOf(overId));
                    }
                } else {
                    // Moving between columns
                    const [movedItem] = activeContainer === 'left' ? newLeft.splice(newLeft.indexOf(activeId), 1) : newRight.splice(newRight.indexOf(activeId), 1);
                    if (overContainer === 'left') {
                        newLeft.splice(newLeft.indexOf(overId), 0, movedItem);
                    } else {
                        newRight.splice(newRight.indexOf(overId), 0, movedItem);
                    }
                }

                return { ...prev, settingsData: { ...prev.settingsData, leftColumnSections: newLeft, rightColumnSections: newRight } };
            });
        } else {
            // --- LOGIC FOR REORDERING ITEMS WITHIN A LIST ---
            const activePrefix = activeId.split('-')[0];
            const overPrefix = overId.split('-')[0];
            if (activePrefix !== overPrefix) return;

            setDraftData((prev) => {
                const oldIndex = parseInt(activeId.split('-')[1], 10);
                const newIndex = parseInt(overId.split('-')[1], 10);

                switch (activePrefix) {
                    case 'job':
                    return { ...prev, experienceData: { jobs: arrayMove(prev.experienceData.jobs, oldIndex, newIndex) } };
                case 'project':
                    return { ...prev, projectsData: { projects: arrayMove(prev.projectsData.projects, oldIndex, newIndex) } };
                case 'degree':
                    return { ...prev, educationData: { degrees: arrayMove(prev.educationData.degrees, oldIndex, newIndex) } };
                case 'skillcat':
                    return { ...prev, skillsData: { skillCategories: arrayMove(prev.skillsData.skillCategories, oldIndex, newIndex) } };
                default:
                    return prev;
                }
            });
        }
    }

    // --- SCROLL-TO-SECTION ON CLICK ---
    const handleNavClick = (sectionId: string) => {
        setActiveSection(sections.find(s => s.id === sectionId)?.name || 'Header');
        
        // Scroll the preview panel to the corresponding ref
        const ref = sectionRefs.current[sectionId];
        if (ref && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchAllData().finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/update-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draftData),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.details || 'Failed to save content');
            }
            toast.success('Content saved successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error(`Error saving: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setResetModalOpen(true);
    };

    const confirmAndReset = async () => {
        setResetModalOpen(false);
        setIsResetting(true);
        await fetchAllData();
        setIsResetting(false);
    };

  
    const renderEditor = () => {
        switch (activeSection) {
            case 'Header': return <HeaderEditor data={draftData.headerData} setData={(d) => setDraftData({ ...draftData, headerData: d })} />;
            case 'About': return <AboutEditor data={draftData.aboutData} setData={(d) => setDraftData({ ...draftData, aboutData: d })} />;
            case 'Experience': return <ExperienceEditor data={draftData.experienceData} setData={(d) => setDraftData({ ...draftData, experienceData: d })} />;
            case 'Projects': return <ProjectsEditor data={draftData.projectsData} setData={(d) => setDraftData({ ...draftData, projectsData: d })} />;
            case 'Education': return <EducationEditor data={draftData.educationData} setData={(d) => setDraftData({ ...draftData, educationData: d })} />;
            case 'Skills': return <SkillsEditor data={draftData.skillsData} setData={(d) => setDraftData({ ...draftData, skillsData: d })} />;
            case 'Settings': return <SettingsEditor data={draftData.settingsData} setData={(d) => setDraftData({ ...draftData, settingsData: d })} setTheme={setTheme} />;
            default: return null;
        }
    };

    const getSortableItems = () => {
        switch (activeSection) {
            case 'Experience': return draftData.experienceData.jobs.map((_, i) => `job-${i}`);
            case 'Projects': return draftData.projectsData.projects.map((_, i) => `project-${i}`);
            case 'Education': return draftData.educationData.degrees.map((_, i) => `degree-${i}`);
            case 'Skills': return draftData.skillsData.skillCategories.map((_, i) => `skillcat-${i}`);
            default: return [];
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">

                {/* --- Navigation Panel --- */}
                <aside className="w-40 bg-[var(--color-bg-secondary)] p-4 flex flex-col border-r border-[var(--color-border-primary)] flex-shrink-0">
                    <h1 className="text-lg font-bold mb-4 px-2">Editor</h1>
                    <nav className="space-y-1 flex-grow">
                    {sections.map(section => {
                            // Skip the 'Settings' tab for navigation scrolling
                            if (section.id === 'settings') {
                                // Render the Settings button without the special scroll handler
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.name)}
                                        className={`w-full flex items-center gap-3 py-2 px-3 rounded-md text-left text-sm font-medium transition-colors ${activeSection === section.name ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'}`}
                                    >
                                        <Icon size={18} />
                                        <span>{section.name}</span>
                                    </button>
                                );
                            }

                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => handleNavClick(section.id)}
                                    className={`w-full flex items-center gap-3 py-2 px-3 rounded-md text-left text-sm font-medium transition-colors ${activeSection === section.name ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'}`}
                                >
                                    <Icon size={18} />
                                    <span>{section.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                    <div className="mt-4 space-y-2">
                        {/* --- Save Changes Button --- */}
                         <button 
                            onClick={handleSave} 
                            disabled={isSaving || isResetting} 
                            className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-solid)] hover:bg-[var(--color-accent-solid-hover)] text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:bg-[var(--color-disabled-bg)] disabled:scale-100 active:scale-95"
                        >
                            {isSaving ? 'Saving...' : <><Save size={16} /><span>Save Changes</span></>}
                        </button>
                        
                        {/* --- Reset Changes Button --- */}
                        <button 
                            onClick={handleReset}
                            disabled={isSaving || isResetting}
                            className="w-full flex items-center justify-center gap-2 bg-transparent border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-bold py-2.5 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
                        >
                            {isResetting ? 'Resetting...' : <><Undo2 size={16} /><span>Reset Changes</span></>}
                        </button>
                    </div>
                </aside>

                {/* --- Content editor panel --- */}
                <main className="editor-panel w-[30%] bg-[var(--color-bg-secondary)] h-full overflow-y-auto border-r border-[var(--color-border-primary)] flex-shrink-0">
                    <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                                // The key is crucial! It tells AnimatePresence when a component changes.
                                key={activeSection}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.1, ease: 'easeInOut' }}
                            >
                            <SortableContext items={getSortableItems()} strategy={verticalListSortingStrategy}>
                                {renderEditor()}
                            </SortableContext>
                        </motion.div>
                    </AnimatePresence>
                    </div>
                </main>

                {/* --- Live preview panel --- */}
                <div className="flex-1 h-full overflow-y-auto">
                    <PortfolioLayout 
                        data={draftData} 
                        isLoading={isLoading} 
                        sectionRefs={sectionRefs.current} 
                        showDragHandle={true}
                    />
                </div>

            </div>

            {/* --- ConfirmationModal --- */}
            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setResetModalOpen(false)}
                onConfirm={confirmAndReset}
                title="Reset All Changes?"
                message="Are you sure you want to discard all unsaved changes? This action cannot be undone."
                confirmText="Yes, Reset"
            />
            
        </DndContext>
    );
}