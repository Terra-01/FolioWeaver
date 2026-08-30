// src/app/api/upload-file/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const uploadType = data.get('uploadType') as string;

        if (!file || !uploadType) {
            return NextResponse.json({ error: 'Missing required form data.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let newFileName: string;
        if (uploadType === 'profile') {
            newFileName = 'profile.jpg';
        } else if (uploadType === 'cv') {
            newFileName = 'cv.pdf';
        } else if (uploadType === 'favicon') {
            newFileName = 'favicon.ico';
        } else {
            return NextResponse.json({ error: 'Invalid uploadType.' }, { status: 400 });
        }
        
        const filePath = path.join(uploadDir, newFileName);
        fs.writeFileSync(filePath, buffer);

        console.log(`File uploaded successfully to: ${filePath}`);

        return NextResponse.json({
            message: 'File uploaded successfully',
            filePath: `/${newFileName}`,
        }, { status: 200 });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
    }
}