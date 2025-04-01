// Custom Netlify build script
const { execSync } = require('child_process');

// Helper function to run commands and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Display Node and npm versions
console.log(`Node version: ${process.version}`);
runCommand('npm --version');

// Clear npm cache
console.log('Clearing npm cache...');
runCommand('npm cache clean --force');

// Install dependencies with specific flags
console.log('Installing dependencies...');
runCommand('npm install --no-audit --no-fund --prefer-offline --legacy-peer-deps');

// Build the project
console.log('Building the project...');
runCommand('npm run build');

console.log('Build process completed!');
