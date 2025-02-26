'use server'

import { writeFile, unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function saveFile(buffer: Buffer, targetPath: string): Promise<string> {
  try {
    await writeFile(targetPath, buffer);
    return targetPath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

export async function readFileContent(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('Failed to read file');
  }
}
