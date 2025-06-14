const fs = require('fs')
const path = require('path')

const sourceDir = path.join(process.cwd(), 'public', 'locales', 'en-GB')
const targetDir = path.join(process.cwd(), 'public', 'locales', 'en')

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

// Function to merge JSON files
function mergeJsonFiles(sourceFile, targetFile) {
  if (!fs.existsSync(sourceFile)) return

  const sourceContent = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'))
  let targetContent = {}
  
  if (fs.existsSync(targetFile)) {
    targetContent = JSON.parse(fs.readFileSync(targetFile, 'utf-8'))
  }

  // Merge source into target, preferring source values
  const mergedContent = { ...targetContent, ...sourceContent }
  
  // Write merged content back to target file
  fs.writeFileSync(targetFile, JSON.stringify(mergedContent, null, 2))
}

// Process all files in source directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const sourcePath = path.join(dir, file)
    const targetPath = path.join(targetDir, file)
    
    if (fs.statSync(sourcePath).isDirectory()) {
      // Create subdirectory in target if it doesn't exist
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true })
      }
      processDirectory(sourcePath)
    } else if (file.endsWith('.json')) {
      mergeJsonFiles(sourcePath, targetPath)
    }
  }
}

// Start processing
console.log('Merging translations from en-GB to en...')
processDirectory(sourceDir)
console.log('Done!')

// Optional: Remove en-GB directory after merging
// fs.rmSync(sourceDir, { recursive: true, force: true })
// console.log('Removed en-GB directory') 