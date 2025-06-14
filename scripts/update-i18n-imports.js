const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// List of files that need to be updated
const filesToUpdate = [
  'src/components/reviews/ReviewBoosterPanel.tsx',
  'src/components/data/cards/CompanyCard.tsx',
  'src/components/reengagement/LeadClassificationPanel.tsx',
  'src/components/search/MapView.tsx',
  'src/components/search/ResultsGrid.tsx',
  'src/components/referrals/ReferralDashboard.tsx',
  'src/components/ui/fixed-pagination.tsx'
];

// Update each file
filesToUpdate.forEach(relativePath => {
  const filePath = path.join(rootDir, relativePath);
  
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update the import statement
    const updatedContent = content.replace(
      /from ["']@\/src\/lib\/i18n\/useTranslation["']/g,
      'from "react-i18next"'
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated ${relativePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${relativePath}:`, error.message);
  }
});

console.log('\n✅ All files have been updated!');
