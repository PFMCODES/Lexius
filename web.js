/**
 * Combined Web Server for Lexius
 * Serves static files and provides File Access API for web version
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const PORT = process.env.PORT || 3456;
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || path.join(__dirname, 'web-workspace');

// Ensure workspace directory exists
async function ensureWorkspaceDir() {
  try {
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create workspace directory:', err);
  }
}

// Normalize and validate file path to prevent directory traversal
function normalizePath(filePath) {
  const resolved = path.resolve(WORKSPACE_DIR, filePath);
  const workspaceResolved = path.resolve(WORKSPACE_DIR);
  
  if (!resolved.startsWith(workspaceResolved + path.sep) && resolved !== workspaceResolved) {
    throw new Error('Access denied: Path traversal attempt');
  }
  
  return resolved;
}

async function listFilesRecursive(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      const subFiles = await listFilesRecursive(fullPath, baseDir);
      files.push(...subFiles);
    } else {
      const stats = await fs.stat(fullPath);
      files.push({
        path: relativePath,
        size: stats.size,
        modified: stats.mtime
      });
    }
  }

  return files;
}

const server = http.createServer(async (req, res) => {
  // CORS headers for web access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // ========== FILE ACCESS API ENDPOINTS ==========
  
  // API endpoint: List files
  if (pathname === '/api/files' && req.method === 'GET') {
    try {
      const files = await listFilesRecursive(WORKSPACE_DIR);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ files }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // API endpoint: Read file
  if (pathname === '/api/files/read' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { path: filePath } = JSON.parse(body);
        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing path parameter' }));
          return;
        }
        
        const fullPath = normalizePath(filePath);
        const content = await fs.readFile(fullPath, 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ content }));
      } catch (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File not found' }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      }
    });
    return;
  }

  // API endpoint: Write file
  if (pathname === '/api/files/write' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { path: filePath, content } = JSON.parse(body);
        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing path parameter' }));
          return;
        }
        
        const fullPath = normalizePath(filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content || '', 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Delete file
  if (pathname === '/api/files/delete' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { path: filePath } = JSON.parse(body);
        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing path parameter' }));
          return;
        }
        
        const fullPath = normalizePath(filePath);
        await fs.unlink(fullPath);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File not found' }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      }
    });
    return;
  }

  // ========== STATIC FILE SERVING ==========
  
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);
  
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';

  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

ensureWorkspaceDir().then(() => {
  server.listen(PORT, () => {
    console.log(`Lexius Web Server running on http://localhost:${PORT}`);
    console.log(`Workspace directory: ${WORKSPACE_DIR}`);
    console.log(`File API available at http://localhost:${PORT}/api/files`);
  });
});