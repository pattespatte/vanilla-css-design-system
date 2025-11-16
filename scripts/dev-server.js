const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { execSync } = require('child_process');

// Configuration
const PORT = process.env.DEV_PORT || 3000;
const HOST = process.env.DEV_HOST || 'localhost';
const EXAMPLES_DIR = path.join(__dirname, '../examples');
const STYLES_DIR = path.join(__dirname, '../styles');
const TOKENS_DIR = path.join(__dirname, '../tokens');

// Store connected clients for hot reload
const clients = new Set();

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
  const fullPath = path.join(EXAMPLES_DIR, filePath);
  
  // If the file doesn't exist, try to serve index.html
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    if (filePath !== '/' && filePath !== '') {
      return serveFile('index.html', res);
    }
    filePath = 'index.html';
    return serveFile(filePath, res);
  }
  
  const ext = path.extname(filePath).toLowerCase();
  
  // For HTML files, inject hot reload script
  if (ext === '.html') {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Inject hot reload script before closing body tag
    const hotReloadScript = `
<script>
  (function() {
    const eventSource = new EventSource('/hot-reload');
    eventSource.onmessage = function(event) {
      if (event.data === 'reload') {
        console.log('Hot reload triggered, refreshing page...');
        window.location.reload();
      }
    };
    eventSource.onerror = function() {
      console.log('Hot reload connection lost, attempting to reconnect...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };
  })();
</script>`;
    
    // Insert before closing body tag or at the end of file
    if (content.includes('</body>')) {
      content = content.replace('</body>', hotReloadScript + '\n</body>');
    } else {
      content += hotReloadScript;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
    return;
  }
  
  // For other files, serve as-is
  const content = fs.readFileSync(fullPath);
  res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
  res.end(content);
}

// Handle hot reload endpoint
function handleHotReload(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Add this client to the list
  clients.add(res);
  
  // Send initial connection message
  res.write('data: connected\n\n');
  
  // Handle client disconnect
  req.on('close', () => {
    clients.delete(res);
  });
}

// Trigger hot reload for all connected clients
function triggerReload() {
  clients.forEach(client => {
    try {
      client.write('data: reload\n\n');
    } catch (e) {
      // Client disconnected, remove from list
      clients.delete(client);
    }
  });
}

// Watch for file changes
function startWatching() {
  console.log('👀 Watching for changes in styles and tokens...');
  
  // Use our custom watch script that integrates with hot reload
  const watchProcess = spawn('node', [path.join(__dirname, 'watch-with-reload.js')], {
    stdio: 'inherit',
    shell: true
  });
  
  watchProcess.on('close', (code) => {
    console.log(`Watch process exited with code ${code}`);
  });
  
  return watchProcess;
}

// Create the HTTP server
const server = http.createServer((req, res) => {
  // Handle hot reload endpoint
  if (req.url === '/hot-reload') {
    handleHotReload(req, res);
    return;
  }
  
  // Parse the URL
  let url = req.url;
  if (url === '/') {
    url = '/index.html';
  }
  
  // Remove query parameters
  url = url.split('?')[0];
  
  // Serve the file
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

// Start watching for file changes
const watchProcess = startWatching();

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`🚀 Development server running at http://${HOST}:${PORT}`);
  console.log(`📁 Serving files from: ${EXAMPLES_DIR}`);
  console.log(`🔥 Hot reload enabled`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  
  // Kill the watch process
  if (watchProcess) {
    watchProcess.kill();
  }
  
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

// Export triggerReload for use by file watcher
global.triggerReload = triggerReload;