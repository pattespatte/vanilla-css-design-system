const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration - only watch source files, not built files
const STYLES_SOURCE_DIR = path.join(__dirname, '../styles/base');
const STYLES_FOUNDATION_DIR = path.join(__dirname, '../styles/foundation');
const STYLES_VARIABLES_DIR = path.join(__dirname, '../styles/variables');
const STYLES_LAYOUT_DIR = path.join(__dirname, '../styles/layout');
const STYLES_COMPONENTS_DIR = path.join(__dirname, '../styles/components');
const STYLES_UTILITIES_DIR = path.join(__dirname, '../styles/utilities');
const STYLES_CUSTOM = path.join(__dirname, '../styles/custom.css');
const TOKENS_DIR = path.join(__dirname, '../tokens');

// Function to run a command and return a promise
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Function to trigger hot reload if the development server is running
function triggerHotReload() {
  // Check if the global triggerReload function exists (dev server is running)
  if (typeof global.triggerReload === 'function') {
    console.log('🔥 Triggering hot reload...');
    global.triggerReload();
  }
}

// Main watch function
async function startWatching() {
  console.log('👀 Starting watch process with hot reload integration...');
  
  // Initial build
  try {
    console.log('🔨 Initial build...');
    await runCommand('npm', ['run', 'build:css']);
    await runCommand('npm', ['run', 'css2tokens']);
    await runCommand('npm', ['run', 'tokens2css']);
    console.log('✅ Initial build completed');
    triggerHotReload();
  } catch (error) {
    console.error('❌ Initial build failed:', error.message);
  }
  
  // Use nodemon to watch for changes in source files only
  const watchDirs = [
    STYLES_SOURCE_DIR,
    STYLES_FOUNDATION_DIR,
    STYLES_VARIABLES_DIR,
    STYLES_LAYOUT_DIR,
    STYLES_COMPONENTS_DIR,
    STYLES_UTILITIES_DIR,
    TOKENS_DIR
  ];
  
  const watchArgs = ['nodemon'];
  
  // Add watch directories
  watchDirs.forEach(dir => {
    watchArgs.push('--watch', dir);
  });
  
  // Also watch the custom.css file
  watchArgs.push('--watch', STYLES_CUSTOM);
  
  // Add other options
  watchArgs.push('--ext', 'css,json');
  watchArgs.push('--exec', 'node', __filename);
  
  const nodemon = spawn('npx', watchArgs, {
    stdio: 'inherit'
  });
  
  // Handle nodemon output
  nodemon.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
  });
  
  nodemon.on('exit', (code) => {
    console.log(`Watch process exited with code ${code}`);
  });
}

// Check if we're being run by nodemon or directly
if (process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('nodemon')) {
  // We're being run by nodemon, so rebuild and trigger reload
  (async () => {
    try {
      console.log('🔄 Files changed, rebuilding...');
      await runCommand('npm', ['run', 'build:css']);
      await runCommand('npm', ['run', 'css2tokens']);
      await runCommand('npm', ['run', 'tokens2css']);
      console.log('✅ Rebuild completed');
      triggerHotReload();
    } catch (error) {
      console.error('❌ Rebuild failed:', error.message);
    }
  })();
} else {
  // We're running directly, start the watch process
  startWatching().catch(error => {
    console.error('❌ Watch process failed:', error);
    process.exit(1);
  });
}