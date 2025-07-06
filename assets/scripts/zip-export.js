import { getAllFiles } from './db.js';
import JSZip from 'https://esm.sh/jszip@3.10.0';

export async function exportAsZip() {
  const files = await getAllFiles();
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.content);
  }

  const blob = await zip.generateAsync({ type: "blob" });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'project.zip';
  a.click();
  URL.revokeObjectURL(a.href);
}