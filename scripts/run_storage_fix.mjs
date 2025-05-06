// Script to run the Supabase storage fix
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('Supabase Storage Fix Runner');
  console.log('==========================');
  
  // Get Supabase API key from user input
  const supabaseKey = await prompt('Enter your Supabase API key (anon or service_role): ');
  
  if (!supabaseKey) {
    console.error('No API key provided. Exiting...');
    process.exit(1);
  }
  
  console.log('Running storage fix script...');
  
  // Run the fix script with the provided API key
  const fixScriptPath = join(__dirname, 'fix_supabase_storage.mjs');
  
  const child = spawn('node', [fixScriptPath], {
    env: { ...process.env, SUPABASE_KEY: supabaseKey },
    stdio: 'inherit'
  });
  
  child.on('close', (code) => {
    console.log(`Storage fix script exited with code ${code}`);
    rl.close();
  });
}

main();
