const http = require('http');
const fs = require('fs');
const path = require('path');

const EXAMPLES_DIR = path.join(__dirname, 'examples');

const server = http.createServer((req, res) => {
  let url = req.url;
  if (url === '/') {
    url = '/index.html';
  }
  
  url = url.split('?')[0];
  const filePath = url.slice(1);
  const fullPath = path.join(EXAMPLES_DIR, filePath);
  
  console.log(`Request: ${req.url}`);
  console.log(`File path: ${filePath}`);
  console.log(`Full path: ${fullPath}`);
  console.log(`File exists: ${fs.existsSync(fullPath)}`);
  
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    console.log('Serving index.html instead');
    const indexPath = path.join(EXAMPLES_DIR, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(content);
});

server.listen(3001, () => {
  console.log('Debug server running on port 3001');
});