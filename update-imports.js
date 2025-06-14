const fs = require('fs');
const path = require('path');

// List of files that need their imports updated
const filesToUpdate = [
  'src/components/reviews/ReviewBoosterPanel.tsx',
  'src/components/reengagement/LeadClassificationPanel.tsx',
  'src/components/data/tables/DataTable.tsx',
  'src/components/ai/AIAssistant.tsx',
  'src/components/search/MapView.tsx',
  'src/components/search/ResultsGrid.tsx',
  'src/components/financial/FinancialSummaryPanel.tsx',
  'src/components/data/cards/CompanyCard.tsx',
  'src/components/referrals/ReferralDashboard.tsx',
  'src/components/core/navigation/SecondaryMenuBar.txt',
  'src/components/ui/fixed-pagination.tsx',
  'app/(dashboard)/lead-response/page.tsx',
  'app/(dashboard)/lead-response/rules/page.tsx',
  'app/(dashboard)/gap-analysis/letters/page.tsx',
  'app/(dashboard)/gap-analysis/results/page.tsx',
  'app/(dashboard)/scrapers/page.tsx',
  'app/(dashboard)/financial/page.tsx'
];

// Update each file
filesToUpdate.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const updatedContent = content.replace(
        /from "@\/lib\/i18n\/useTranslation"/g, 
        'from "@/src/lib/i18n/useTranslation"'
      );
      
      if (content !== updatedContent) {
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        console.log(`✅ Updated imports in ${filePath}`);
      } else {
        console.log(`ℹ️  No changes needed for ${filePath}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\nImport path update complete!');
