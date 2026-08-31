// src/app/api/content/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// The complete set of content files. `file` is a query parameter and was
// previously interpolated straight into path.join, so `?file=../../../secrets`
// read any .md the process could reach. This route is one of the few that ships
// inside every exported portfolio, so that traversal travelled to every user
// who deployed one. An allowlist is the right shape here because the set is
// closed and known — there is no legitimate caller asking for anything else.
const CONTENT_FILES = [
  'about',
  'education',
  'experience',
  'header',
  'projects',
  'settings',
  'skills',
] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file');

  if (!fileName) {
    return NextResponse.json({ error: 'File name is required' }, { status: 400 });
  }

  if (!(CONTENT_FILES as readonly string[]).includes(fileName)) {
    return NextResponse.json({ error: 'Unknown content file' }, { status: 400 });
  }

  try {
    const contentDirectory = path.join(process.cwd(), 'src/content');
    const fullPath = path.join(contentDirectory, `${fileName}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // Parse the front matter and the content from the file
    const matterResult = matter(fileContents);

    // Only process markdown body to HTML if it exists
    let contentHtml = '';
    if (matterResult.content) {
      // Convert the markdown content into an HTML string
      const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
      contentHtml = processedContent.toString();
    }
    
    // Return BOTH the HTML content AND the front matter data
    return NextResponse.json({ 
      contentHtml,
      markdownContent: matterResult.content,
      ...matterResult.data
    });

  } catch (error) {
    console.error(`Error reading file ${fileName}.md:`, error);
    return NextResponse.json({ error: 'File not found or processing failed' }, { status: 404 });
  }
}