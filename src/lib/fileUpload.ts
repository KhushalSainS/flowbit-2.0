import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
const ensureUploadDir = async () => {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
};

interface FormDataField {
  name: string;
  value: string;
}

interface FileData {
  name: string;
  type: string;
  size: number;
  path: string;
  buffer: Buffer;
}

interface FormDataResult {
  fields: Record<string, string>;
  file?: FileData;
}

export async function parseFormData(req: NextRequest): Promise<FormDataResult> {
  const formData = await req.formData();
  const fields: Record<string, string> = {};
  let file: FileData | undefined;

  // Extract fields and file from form data
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer());
      const fileName = value.name;
      const fileType = value.type;
      const fileSize = value.size;
      
      // Ensure upload directory exists
      await ensureUploadDir();
      
      // Generate unique filename
      const uniqueId = uuidv4();
      const ext = path.extname(fileName);
      const uniqueFileName = `${uniqueId}${ext}`;
      const filePath = path.join(UPLOAD_DIR, uniqueFileName);
      
      // Save file to disk
      fs.writeFileSync(filePath, buffer);
      
      file = {
        name: fileName,
        type: fileType,
        size: fileSize,
        path: filePath,
        buffer,
      };
    } else {
      fields[key] = value.toString();
    }
  }
  
  return { fields, file };
}
