#!/usr/bin/env node

/**
 * This script helps reset the React Native development environment
 * when encountering device connection issues like "Unknown device with ID"
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper to print colored messages
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Get project root directory
const projectRoot = path.resolve(__dirname, '..');

try {
  // Step 1: Kill any running Metro instances
  log('Stopping any running Metro processes...', colors.yellow);
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      execSync('pkill -f "metro" || true');
    } else if (process.platform === 'win32') {
      execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro" || true', { stdio: 'ignore' });
    }
  } catch (e) {
    // Ignore errors if no processes are found
  }
  
  // Step 2: Clear Metro cache
  log('Clearing Metro bundler cache...', colors.yellow);
  const tempDir = path.join(projectRoot, 'node_modules', '.cache', 'metro');
  if (fs.existsSync(tempDir)) {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      execSync(`rm -rf "${tempDir}"`);
    } else {
      execSync(`rmdir /S /Q "${tempDir}"`, { stdio: 'ignore' });
    }
  }
  
  // Step 3: Clear React Native cache
  log('Clearing React Native cache...', colors.yellow);
  try {
    execSync('npx react-native start --reset-cache', { stdio: 'ignore' });
    execSync('npx expo start --clear', { stdio: 'ignore' });
  } catch (e) {
    // Ignore errors during cache reset
  }
  
  // Step 4: Extra cleanup for iOS/Android specific caches
  if (fs.existsSync(path.join(projectRoot, 'ios'))) {
    log('Cleaning iOS build directory...', colors.blue);
    try {
      execSync(`cd "${path.join(projectRoot, 'ios')}" && xcodebuild clean`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore if xcodebuild is not available
    }
  }
  
  if (fs.existsSync(path.join(projectRoot, 'android'))) {
    log('Cleaning Android build directory...', colors.green);
    try {
      execSync(`cd "${path.join(projectRoot, 'android')}" && ./gradlew clean`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore if gradlew fails
    }
  }

  log('Environment reset complete! Try running your app again.', colors.cyan);
  log('\nUse one of these commands to restart:', colors.magenta);
  log('  npx expo start', colors.reset);
  log('  npm start', colors.reset);
  
} catch (error) {
  log(`An error occurred: ${error.message}`, colors.red);
  process.exit(1);
}
