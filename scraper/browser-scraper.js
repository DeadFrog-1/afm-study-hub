// ─────────────────────────────────────────────
// Browser-based ACCA Scraper
// Run: node scraper/browser-scraper.js --chapter=1
// ─────────────────────────────────────────────
require('dotenv').config({ path: '.env.local' });
const fs = require('fs-extra');
const path = require('path');

const CONTENT_DIR = process.env.CONTENT_DIR || './content/chapters';

const args = process.argv.slice(2);
const chapterArg = args.find(a => a.startsWith('--chapter='));
const chapterNum = chapterArg ? parseInt(chapterArg.split('=')[1]) : null;

if (!chapterNum || chapterNum < 1 || chapterNum > 18) {
  console.error('Usage: node scraper/browser-scraper.js --chapter=N (1-18)');
  process.exit(1);
}

const chapterId = `ch${String(chapterNum).padStart(2, '0')}`;
const outputDir = path.join(CONTENT_DIR, chapterId);
const mediaDir = path.join(outputDir, 'media');

const CHAPTER_TITLES = {
  1: 'Role of Financial Strategy',
  2: 'Basic Investment Appraisal',
  3: 'Security Valuation and the Cost of Capital',
  4: 'Weighted Average Cost of Capital and Gearing',
  5: 'CAPM and Betas',
  6: 'Advanced Investment Appraisal',
  7: 'Business Valuation',
  8: 'Mergers and Acquisitions',
  9: 'Corporate Reconstruction and Re-organisation',
  10: 'Equity Issues',
  11: 'Debt Issues',
  12: 'Dividend Policy',
  13: 'Options',
  14: 'Foreign Exchange Risk Management',
  15: 'Interest Rate Risk Management',
  16: 'The Economic Environment for Multinationals',
  17: 'International Operations',
  18: 'Financial Statement Analysis',
};

// Section names for Chapter 1 (from the dropdown)
const CHAPTER_1_SECTIONS = [
  'CHAPTER 1: Visual Overview',
  '1.1.1 To Achieve Organisational Goals',
  '1.1.2 Financial Management',
  '1.2.1 Corporate Objectives in Practice',
  '1.2.2 Maximisation of Shareholder Wealth',
  '1.2.3 Communication to Stakeholders',
  '1.3.1 Agency Theory',
  '1.3.2 Stakeholders',
  '1.3.3 Directors and Shareholders',
  '1.3.4 Goal Congruence',
  '1.4.1 Ethical Contexts for the Financial Executive or Adviser',
  '1.4.2 Ethical Decision-Making',
  '1.4.3 Ethical Decision-Making Models (EDMM)',
  '1.4.4 Ethics: Agency Issues and Stakeholder Conflicts',
  '1.5.1 Sustainability',
  '1.5.2 Triple Bottom-Line Reporting (TBL or 3BL)',
  '1.5.3 Modern Approaches to Reporting ESG Issues',
  '1.6.1 Need for Risk Management',
  '1.6.2 Conflicts Between Equity and Debt Investors',
  '1.6.3 Types of Risk and Risk Mitigation',
  '1.6.4 Risk Mitigation, Hedging and Diversification',
  '1.6.5 Developing a Framework for Risk Management',
  '1 Syllabus Coverage',
  '1 Summary and Quiz',
  '1 Technical Articles',
];

async function main() {
  await fs.ensureDir(outputDir);
  await fs.ensureDir(mediaDir);

  console.log(`\n🎓 ACCA Study Hub Scraper — Chapter ${chapterNum}`);
  console.log(`   ${CHAPTER_TITLES[chapterNum]}\n`);
  console.log('   Instructions:');
  console.log('   1. Open the ACCA Study Hub in your browser');
  console.log('   2. Navigate to the AFM chapter you want to scrape');
  console.log('   3. Open browser DevTools (F12) → Console tab');
  console.log('   4. Paste the scraper snippet below and press Enter');
  console.log('   5. The scraper will extract all sections automatically\n');

  // Generate the browser-side scraper snippet
  const snippet = `
// ── ACCA Study Hub Content Extractor ──
// Paste this in browser DevTools console while on the Study Hub page

(async function scrapeChapter() {
  const results = [];
  const sectionDropdown = document.querySelector('select, [role="listbox"]');
  
  // Find all section options
  const options = document.querySelectorAll('option, [role="option"]');
  const chapterSections = Array.from(options).filter(opt => {
    const text = opt.textContent.trim();
    return text.startsWith('${chapterNum}.') || text.startsWith('CHAPTER ${chapterNum}:') || text.startsWith('${chapterNum} ');
  });
  
  console.log('Found ' + chapterSections.length + ' sections to scrape');
  
  for (let i = 0; i < chapterSections.length; i++) {
    const opt = chapterSections[i];
    const sectionName = opt.textContent.trim();
    console.log('Scraping: ' + sectionName);
    
    // Click the option to navigate
    opt.click();
    await new Promise(r => setTimeout(r, 2000));
    
    // Extract content
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (!mainContent) continue;
    
    // Get the content area (skip navigation)
    const contentArea = mainContent.querySelector('article, .content, .reading-content') || mainContent;
    
    // Extract text and HTML
    const title = contentArea.querySelector('h2, h3')?.textContent?.trim() || sectionName;
    const html = contentArea.innerHTML;
    
    // Extract images
    const images = Array.from(contentArea.querySelectorAll('img')).map(img => ({
      src: img.src || img.getAttribute('data-src'),
      alt: img.alt
    })).filter(i => i.src && !i.src.includes('data:'));
    
    results.push({
      id: 'ch${String(chapterNum).padStart(2, '0')}-p' + String(i + 1).padStart(2, '0'),
      title: title,
      contentHtml: html,
      images: images,
      mediaRefs: []
    });
    
    console.log('  ✓ Extracted: ' + title);
  }
  
  // Output as JSON
  const output = JSON.stringify(results, null, 2);
  console.log('\\n=== SCRAPING COMPLETE ===');
  console.log('Total sections: ' + results.length);
  console.log('\\nCopy the JSON below and save it:');
  console.log(output);
  
  // Also try to copy to clipboard
  try {
    await navigator.clipboard.writeText(output);
    console.log('\\n✓ JSON copied to clipboard!');
  } catch(e) {
    console.log('\\n(Could not auto-copy to clipboard - please copy manually)');
  }
  
  return results;
})();
`;

  // Save the snippet
  const snippetPath = path.join(outputDir, 'scraper-snippet.js');
  await fs.writeFile(snippetPath, snippet);
  console.log(`   Browser snippet saved to: ${snippetPath}`);
  console.log('   Copy the contents and paste into DevTools console.\n');

  // Also save the section list
  const sectionListPath = path.join(outputDir, 'sections.json');
  await fs.writeJson(sectionListPath, CHAPTER_1_SECTIONS, { spaces: 2 });
  console.log(`   Section list saved to: ${sectionListPath}\n`);
}

main().catch(console.error);
