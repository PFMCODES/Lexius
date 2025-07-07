import { getAllFiles } from './db.js';
import JSZip from 'https://cdn.skypack.dev/jszip';

export async function exportAsZip() {
  const zip = new JSZip();
  const files = await getAllFiles();

  for (const file of files) {
    if (!file.name || typeof file.content !== 'string') continue;
    zip.file(file.name, file.content);
  }
  console.log(await getAllFiles());
  const blob = await zip.generateAsync({ type: 'blob' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'project.zip';
  link.click();
}