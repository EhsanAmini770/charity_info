/**
 * Script to find and replace console.log statements with debug utility
 *
 * Usage:
 * node scripts/replaceConsoleLogs.js [--dry-run] [--path=<directory>]
 *
 * Options:
 * --dry-run: Only show what would be changed, don't actually modify files
 * --path: Specify a subdirectory to process (default: entire backend)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../utils/logger');
const debug = require('../utils/debug').createNamespace('replace-logs');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const pathArg = args.find(arg => arg.startsWith('--path='));
const targetPath = pathArg ? pathArg.split('=')[1] : '.';

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.git',
  'logs',
  'uploads',
  'public',
  'scripts'
];

// Files to exclude
const excludeFiles = [
  'debug.js'
];

// File extensions to process
const extensions = ['.js'];

// Counter for statistics
let stats = {
  filesScanned: 0,
  filesModified: 0,
  logsReplaced: 0
};

// Regular expressions for finding console.log statements
const consoleLogRegex = /console\.log\((.*?)\);/g;
const consoleErrorRegex = /console\.error\((.*?)\);/g;
const consoleWarnRegex = /console\.warn\((.*?)\);/g;

/**
 * Check if a file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath);

  // Check extension
  if (!extensions.includes(ext)) {
    return false;
  }

  // Check excluded files
  if (excludeFiles.includes(basename)) {
    return false;
  }

  // Check excluded directories
  const relativePath = path.relative(process.cwd(), filePath);
  return !excludeDirs.some(dir => relativePath.startsWith(dir));
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;

    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip files that already use the debug utility
    if (content.includes('const debug = require') ||
        content.includes('createNamespace')) {
      debug.log(`Skipping ${filePath} (already uses debug utility)`);
      return;
    }

    // Extract the module name from the file path
    const moduleName = path.basename(filePath, path.extname(filePath));

    // Replace console.log statements
    let newContent = content;
    let logCount = 0;

    // Replace console.log
    newContent = newContent.replace(consoleLogRegex, (match, args) => {
      logCount++;
      return `debug.log(${args});`;
    });

    // Replace console.error
    newContent = newContent.replace(consoleErrorRegex, (match, args) => {
      logCount++;
      return `debug.error(${args});`;
    });

    // Replace console.warn
    newContent = newContent.replace(consoleWarnRegex, (match, args) => {
      logCount++;
      return `debug.log(${args}); // was console.warn`;
    });

    // If no replacements were made, skip
    if (logCount === 0) {
      return;
    }

    // Add debug import if needed
    if (!newContent.includes('const debug = require')) {
      const importStatement = `const debug = require('../utils/debug').createNamespace('${moduleName}');\n`;

      // Find a good place to insert the import
      const lines = newContent.split('\n');
      let insertIndex = 0;

      // Look for the last require/import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('require(') || lines[i].includes('import ')) {
          insertIndex = i + 1;
        }
      }

      // Insert the import statement
      lines.splice(insertIndex, 0, importStatement);
      newContent = lines.join('\n');
    }

    // Write the modified content back to the file
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }

    debug.log(`${dryRun ? '[DRY RUN] Would modify' : 'Modified'} ${filePath} (${logCount} logs replaced)`);
    stats.filesModified++;
    stats.logsReplaced += logCount;
  } catch (error) {
    debug.error(`Error processing ${filePath}`, error);
    logger.error({
      message: `Error processing file: ${filePath}`,
      error: error.message,
      stack: error.stack
    });
  }
}

/**
 * Recursively process files in a directory
 */
function processDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (excludeDirs.includes(entry.name)) {
          continue;
        }

        processDirectory(fullPath);
      } else if (entry.isFile() && shouldProcessFile(fullPath)) {
        processFile(fullPath);
      }
    }
  } catch (error) {
    debug.error(`Error processing directory ${dirPath}`, error);
    logger.error({
      message: `Error processing directory: ${dirPath}`,
      error: error.message,
      stack: error.stack
    });
  }
}

// Main execution
debug.log(`${dryRun ? '[DRY RUN] ' : ''}Replacing console.log statements with debug utility...`);
debug.log(`Target path: ${path.resolve(targetPath)}`);

// Process the target directory
processDirectory(targetPath);

// Print statistics
debug.log('\nStatistics:');
debug.log(`Files scanned: ${stats.filesScanned}`);
debug.log(`Files modified: ${stats.filesModified}`);
debug.log(`Logs replaced: ${stats.logsReplaced}`);

if (dryRun) {
  debug.log('\nThis was a dry run. No files were actually modified.');
  debug.log('Run without --dry-run to apply changes.');
}

// Log to application logger as well
logger.info({
  message: `Console log replacement completed`,
  stats: {
    filesScanned: stats.filesScanned,
    filesModified: stats.filesModified,
    logsReplaced: stats.logsReplaced,
    dryRun
  }
});
