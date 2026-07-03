const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PORT = process.env.DEV_PORT || 3000;
const HOST = process.env.DEV_HOST || 'localhost';
const PROJECT_ROOT = path.join(__dirname, '..');
const EXAMPLES_DIR = path.join(PROJECT_ROOT, 'examples');

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json',
};

// Get MIME type for a file
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

// Resolve a request path against a root directory, refusing anything that
// escapes the root. Returns an absolute path inside root, or null on rejection.
function resolveWithin(root, requestPath) {
  const resolved = path.resolve(root, requestPath);
  // `resolved === root` (the bare dir) is allowed; anything beneath it must
  // share the root + separator prefix.
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }
  return resolved;
}

// Serve a file. If it does not exist or is a directory, fall back to
// index.html exactly once (tracked via `fellBack`) instead of recursing.
function serveFile(requestPath, res, fellBack = false) {
  let root;
  let fullPath;

  // Requests for the styles directory are served from the project root so the
  // source CSS is available to the examples; everything else from examples/.
  if (requestPath.startsWith('styles/')) {
    root = PROJECT_ROOT;
    fullPath = resolveWithin(root, requestPath);
  } else {
    root = EXAMPLES_DIR;
    fullPath = resolveWithin(root, requestPath);
  }

  // Reject path-traversal attempts.
  if (fullPath === null) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    console.warn(`Rejected path outside root: ${requestPath}`);
    return;
  }

  console.log(`Attempting to serve: ${fullPath}`);

  // If file doesn't exist or is a directory, fall back to index.html once.
  const exists = fs.existsSync(fullPath);
  const isDir = exists && fs.statSync(fullPath).isDirectory();
  if (!exists || isDir) {
    if (fellBack) {
      // index.html itself is missing — don't recurse forever.
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      console.error(`index.html not found under ${EXAMPLES_DIR}`);
      return;
    }
    console.log(`File not found or is directory: ${fullPath}, serving index.html instead`);
    return serveFile('index.html', res, true);
  }

  const ext = path.extname(fullPath).toLowerCase();

  // For HTML files, inject live reload script
  if (ext === '.html') {
    const content = fs.readFileSync(fullPath, 'utf8');

    // Inject live reload script before closing body tag
    const liveReloadScript = `
<script>
  (function() {
    console.log('Live reload enabled - refresh the page to see CSS changes');

    // Check for CSS changes every 2 seconds
    setInterval(() => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('main.css')) {
          // Force reload by adding timestamp
          const newHref = href.split('?')[0] + '?t=' + Date.now();
          link.setAttribute('href', newHref);
        }
      });
    }, 2000);
  })();
</script>`;

    // Insert before closing body tag or at the end of the file
    let finalContent;
    if (content.includes('</body>')) {
      finalContent = content.replace('</body>', liveReloadScript + '\n</body>');
    } else {
      finalContent = content + liveReloadScript;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(finalContent);
    return;
  }

  // For CSS files, add cache control headers
  if (ext === '.css') {
    const content = fs.readFileSync(fullPath);
    res.writeHead(200, {
      'Content-Type': 'text/css',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content);
    return;
  }

  // For other files, serve as-is
  const content = fs.readFileSync(fullPath);
  res.writeHead(200, { 'Content-Type': getMimeType(fullPath) });
  res.end(content);
}

// Switch between dev/prod example bundles. Failures are logged but never
// crash the server lifecycle, so a mid-run error doesn't leave the working
// tree in an inconsistent state or block the server from starting.
function switchMode(mode) {
  try {
    console.log(`🔄 Switching to ${mode} mode...`);
    execSync(`npm run switch:${mode}`, { stdio: 'inherit' });
    console.log(`✅ Switched to ${mode} mode`);
  } catch (error) {
    console.error(`❌ Error switching to ${mode} mode:`, error.message);
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse URL
  let url = req.url;
  if (url === '/') {
    url = '/index.html';
  }

  // Remove query parameters
  url = url.split('?')[0];

  // Remove /examples/ prefix if present (since we're already serving from examples directory)
  if (url.startsWith('/examples/')) {
    url = url.substring('/examples/'.length);
  }

  // Serve file
  serveFile(url.slice(1), res);
});

// Switch to dev mode
switchMode('dev');

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`🚀 Development server running at http://${HOST}:${PORT}`);
  console.log(`📁 Serving files from: ${EXAMPLES_DIR}`);
  console.log(`🔥 Live reload enabled (CSS changes will be applied automatically)`);
  console.log(`\n💡 Tips:`);
  console.log(`   - Edit CSS files in the styles/ directory`);
  console.log(`   - Run 'npm run build:css' to rebuild the combined CSS`);
  console.log(`   - Changes will be reflected automatically in the browser`);
  console.log(`   - Press Ctrl+C to stop the server and switch back to production mode`);
});

// Handle server errors, particularly for port conflicts
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`\n🔧 Solutions:`);
    console.error(`   1. Kill the process using port ${PORT}:`);
    console.error(`      lsof -ti:${PORT} | xargs kill`);
    console.error(`\n   2. Or use a different port:`);
    console.error(`      DEV_PORT=${parseInt(PORT, 10) + 1} npm run dev`);
    console.error(`\n   3. Or find what's using the port:`);
    console.error(`      lsof -i :${PORT}`);
    console.error(`\n💡 Tip: This error usually happens when a previous dev server is still running.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');

  // Switch back to prod mode
  switchMode('prod');

  // Close the server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
