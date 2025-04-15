import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories to scan
const pagesDir = path.join(__dirname, 'src', 'pages');
const componentsDir = path.join(__dirname, 'src', 'components');

// Define theme-related imports to look for
const themeImports = [
  "import theme from '../theme/theme'",
  "import theme from './theme/theme'",
  "import { useTheme }",
  "theme.palette",
  "theme.typography",
  "ThemeProvider"
];

// Define components that should use theme
const themeComponents = [
  "CardWithTheme",
  "DashboardWithTheme",
  "ThemeWrapper",
  "BrandButton",
  "BrandHeading",
  "BrandTextField",
  "BrandPaper"
];

// Function to check if a file uses the theme
function checkThemeUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for theme imports
    const hasThemeImport = themeImports.some(importStr => content.includes(importStr));
    
    // Check for theme component usage
    const usesThemeComponent = themeComponents.some(component => content.includes(component));
    
    // Check for direct theme usage
    const usesThemeDirectly = content.includes('useTheme()') || 
                              content.includes('theme.palette') || 
                              content.includes('theme={theme}');
    
    return {
      path: filePath,
      hasThemeImport,
      usesThemeComponent,
      usesThemeDirectly,
      usesTheme: hasThemeImport || usesThemeComponent || usesThemeDirectly
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return {
      path: filePath,
      error: error.message
    };
  }
}

// Function to scan a directory recursively
function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath, results);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
      const result = checkThemeUsage(filePath);
      results.push(result);
    }
  }
  
  return results;
}

// Scan pages and components
console.log('Scanning for theme usage...');
const results = [
  ...scanDirectory(pagesDir),
  ...scanDirectory(componentsDir)
];

// Group results
const usingTheme = results.filter(r => r.usesTheme);
const notUsingTheme = results.filter(r => !r.usesTheme && !r.error);
const errors = results.filter(r => r.error);

// Print summary
console.log('\n=== THEME USAGE SUMMARY ===');
console.log(`Total files scanned: ${results.length}`);
console.log(`Files using theme: ${usingTheme.length}`);
console.log(`Files not using theme: ${notUsingTheme.length}`);
console.log(`Files with errors: ${errors.length}`);

// Print details
console.log('\n=== FILES USING THEME ===');
usingTheme.forEach(file => {
  const relativePath = path.relative(__dirname, file.path);
  console.log(`✅ ${relativePath}`);
});

console.log('\n=== FILES NOT USING THEME ===');
notUsingTheme.forEach(file => {
  const relativePath = path.relative(__dirname, file.path);
  console.log(`❌ ${relativePath}`);
});

// Print dashboard and card routes that need theme
console.log('\n=== DASHBOARD AND CARD ROUTES THAT NEED THEME ===');
const dashboardRoutes = notUsingTheme.filter(file => {
  const fileName = path.basename(file.path);
  return (
    fileName.includes('Dashboard') || 
    fileName.includes('Card') || 
    fileName.includes('Menu') || 
    fileName.includes('List') ||
    fileName.includes('Directory') ||
    fileName.includes('Budget') ||
    fileName.includes('Checklist') ||
    fileName.includes('Timeline')
  );
});

dashboardRoutes.forEach(file => {
  const relativePath = path.relative(__dirname, file.path);
  console.log(`🔴 ${relativePath} - Should be updated to use theme`);
});

if (errors.length > 0) {
  console.log('\n=== ERRORS ===');
  errors.forEach(file => {
    const relativePath = path.relative(__dirname, file.path);
    console.log(`❗ ${relativePath}: ${file.error}`);
  });
}

console.log('\nDone!');
