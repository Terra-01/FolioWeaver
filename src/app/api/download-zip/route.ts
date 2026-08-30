// src/app/api/download-zip/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';

// The root directory of your project
const projectRoot = process.cwd();

// --- The exact list of files and directories needed for the final portfolio ---
const requiredFiles = [
    // Root files
    'eslint.config.mjs',
    'next-env.d.ts',
    'next.config.ts',
    'postcss.config.mjs',
    'README.md',
    'tailwind.config.ts',
    'tsconfig.json',
    // Directories to include fully
    'src/app/api/content',
    'src/components/icons',
    'src/content',
    'src/lib',
    'public',
    // Specific files in src/app
    'src/app/globals.css',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    // Specific files in src/components
    'src/components/About.tsx',
    'src/components/DownloadCV.tsx',
    'src/components/Education.tsx',
    'src/components/EmptyState.tsx',
    'src/components/Experience.tsx',
    'src/components/PortfolioLayout.tsx',
    'src/components/Projects.tsx',
    'src/components/Skills.tsx',
    'src/components/Socials.tsx',
    'src/components/SortableItem.tsx',
    'src/components/ThemeProvider.tsx',
    'src/components/ThemeSwitcher.tsx',
];

// Lightweight package.json content for the final user
const lightweightPackageJson = {
    name: "my-portfolio",
    version: "0.1.0",
    private: true,
    scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint"
    },
    // Keep these in step with the root package.json. SortableItem.tsx ships in
    // the export and imports @dnd-kit/utilities directly, and @dnd-kit/sortable
    // requires @dnd-kit/core as a peer — omitting either left the exported
    // manifest resolving only by npm's hoisting, i.e. broken on its own terms.
    dependencies: {
        "@dnd-kit/core": "^6.3.1",
        "@dnd-kit/sortable": "^10.0.0",
        "@dnd-kit/utilities": "^3.2.2",
        "@vercel/analytics": "^1.5.0",
        "gray-matter": "^4.0.3",
        "lucide-react": "^0.525.0",
        "next": "15.5.23",
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "react-hot-toast": "^2.5.2",
        "remark": "^15.0.1",
        "remark-html": "^16.0.1"
    },
    devDependencies: {
        "@eslint/eslintrc": "^3",
        "@tailwindcss/postcss": "^4",
        "@tailwindcss/typography": "^0.5.16",
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "eslint": "^9",
        "eslint-config-next": "15.5.23",
        "tailwindcss": "^4",
        "typescript": "^5"
    }
};

// Machine-local cruft that must never land in someone's exported project.
const EXCLUDED_NAMES = new Set(['.DS_Store', 'Thumbs.db', '.git', 'node_modules']);

// Deliberately throws rather than warning. A missing path used to be swallowed
// with console.warn while the route still returned 200, so a broken export
// reached the user as a silently incomplete ZIP with no indication anything was
// wrong. The caller turns a throw into a 500 that names what is missing.
const addFileOrFolderToZip = async (zip: JSZip, projectPath: string) => {
    if (EXCLUDED_NAMES.has(path.basename(projectPath))) return;

    const fullPath = path.join(projectRoot, projectPath);
    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
        const files = await fs.readdir(fullPath);
        for (const file of files) {
            await addFileOrFolderToZip(zip, path.join(projectPath, file));
        }
    } else {
        const content = await fs.readFile(fullPath);
        zip.file(projectPath, content);
    }
};

export async function GET() {
    try {
        const zip = new JSZip();

        // 1. Add all the required files and folders
        const missing: string[] = [];
        for (const filePath of requiredFiles) {
            try {
                await addFileOrFolderToZip(zip, filePath);
            } catch {
                missing.push(filePath);
            }
        }

        // Refuse to hand over a partial project. Better a clear error than a
        // ZIP that looks fine and does not build.
        if (missing.length > 0) {
            console.error('Export aborted; missing required paths:', missing);
            return NextResponse.json(
                {
                    error: 'Export is incomplete, so no ZIP was produced.',
                    missing,
                },
                { status: 500 }
            );
        }

        // 2. Add the custom, lightweight package.json
        zip.file('package.json', JSON.stringify(lightweightPackageJson, null, 2));
        
        // 3. Add a clean README for the user
        const readmeContent = `# My Portfolio\n\nThis project was generated using the Terra Portfolio Builder.\n\n## Getting Started\n\n1. **Install dependencies:**\n   \`\`\`bash\n   npm install\n   \`\`\`\n\n2. **Run the development server:**\n   \`\`\`bash\n   npm run dev\n   \`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000) to see your portfolio.\n\n## Deployment\n\nThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).`;
        zip.file('README.md', readmeContent);

        // arraybuffer rather than nodebuffer: since the typed-array generics
        // landed in TypeScript 5.7, neither Buffer nor Uint8Array<ArrayBufferLike>
        // is assignable to BodyInit, because BodyInit wants a view backed by a
        // plain ArrayBuffer. A raw ArrayBuffer satisfies it directly.
        const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });

        return new NextResponse(zipBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="my-portfolio.zip"`,
            },
        });

    } catch (error) {
        console.error('Error creating ZIP:', error);
        return NextResponse.json({ error: 'Failed to create ZIP file' }, { status: 500 });
    }
}