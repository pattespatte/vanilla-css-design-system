const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PORT = process.env.DEV_PORT || 3000;
const HOST = process.env.DEV_HOST || 'localhost';
const EXAMPLES_DIR = path.join(__dirname, '../examples');
const STYLES_DIR = path.join(__dirname, '../styles');

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Get MIME type for a file
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

// Serve a file
function serveFile(filePath, res) {
  let fullPath;
  
  // Check if this is a request for styles directory
  if (filePath.startsWith('styles/')) {
    fullPath = path.join(__dirname, '..', filePath);
  } else {
    fullPath = path.join(EXAMPLES_DIR, filePath);
  }
  
  console.log(`Attempting to serve: ${fullPath}`);
  
  // If file doesn't exist, try to serve index.html
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    console.log(`File not found or is directory: ${fullPath}, serving index.html instead`);
    if (filePath !== '/' && filePath !== '') {
      return serveFile('index.html', res);
    }
    filePath = 'index.html';
    return serveFile(filePath, res);
  }
  
  const ext = path.extname(filePath).toLowerCase();
  
  // For HTML files, inject live reload script
  if (ext === '.html') {
    let content = fs.readFileSync(fullPath, 'utf8');
    
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
    if (content.includes('</body>')) {
      content = content.replace('</body>', liveReloadScript + '\n</body>');
    } else {
      content += liveReloadScript;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
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
  res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
  res.end(content);
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
try {
  console.log('🔄 Switching to development mode...');
  execSync('npm run switch:dev', { stdio: 'inherit' });
  console.log('✅ Switched to development mode');
} catch (error) {
  console.error('❌ Error switching to development mode:', error.message);
}

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
    console.error(`      DEV_PORT=${parseInt(PORT) + 1} npm run dev`);
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
  try {
    console.log('🔄 Switching back to production mode...');
    execSync('npm run switch:prod', { stdio: 'inherit' });
    console.log('✅ Switched to production mode');
  } catch (error) {
    console.error('❌ Error switching to production mode:', error.message);
  }
  
  // Close the server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});