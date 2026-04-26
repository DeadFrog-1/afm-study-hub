// ─────────────────────────────────────────────
// ACCA Study Hub Scraper — Playwright
// Usage: node scraper/scraper.js --chapter=1 [--debug]
// ─────────────────────────────────────────────
require('dotenv').config({ path: '.env.local' });
const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const BASE_URL = process.env.ACCA_PORTAL_BASE_URL || 'https://studyhub.accaglobal.com';
const USERNAME = process.env.ACCA_PORTAL_USERNAME;
const PASSWORD = process.env.ACCA_PORTAL_PASSWORD;
const CONTENT_DIR = process.env.CONTENT_DIR || './content/chapters';

// Parse args
const args = process.argv.slice(2);
const chapterArg = args.find(a => a.startsWith('--chapter='));
const debugMode = args.includes('--debug');
const chapterNum = chapterArg ? parseInt(chapterArg.split('=')[1]) : null;

if (!chapterNum || chapterNum < 1 || chapterNum > 18) {
  console.error('Usage: node scraper/scraper.js --chapter=N (1-18) [--debug]');
  process.exit(1);
}

const chapterId = `ch${String(chapterNum).padStart(2, '0')}`;
const outputDir = path.join(CONTENT_DIR, chapterId);
const mediaDir = path.join(outputDir, 'media');

// Chapter titles
const CHAPTER_TITLES = {
  1: 'Financial Management and Goals of Organisations',
  2: 'Applying Financial Appraisal Techniques',
  3: 'Working Capital Management',
  4: 'Business Valuations and Merger Analysis',
  5: 'Corporate Finance Risk Management',
  6: 'Investment Appraisal — Allowing for Inflation',
  7: 'Growth and Sustainability — Analysis and Planning',
  8: 'International Financial Management',
  9: 'Treasury Management',
  10: 'Business Restructuring and Insolvency',
  11: 'Corporate Governance and Ethics',
  12: 'Environmental and Social Factors',
  13: 'Emerging Issues in Financial Management',
  14: 'Section A Case Study Orientation',
  15: 'Section B Case Study (Scenario 1)',
  16: 'Section B Case Study (Scenario 2)',
  17: 'Section B Case Study (Scenario 3)',
  18: 'Exam Technique and Revision',
};

async function downloadMedia(url, filepath, cookies) {
  try {
    const resp = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: cookies ? { Cookie: cookies } : {},
    });
    await fs.writeFile(filepath, resp.data);
    return true;
  } catch (err) {
    console.error(`  ✗ Failed to download: ${url} — ${err.message}`);
    return false;
  }
}

async function getCookies(page) {
  const cookies = await page.context().cookies();
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

async function scrapeChapter() {
  console.log(`\n🎓 AFM Study Hub Scraper — Chapter ${chapterNum}`);
  console.log(`   ${CHAPTER_TITLES[chapterNum] || 'Unknown Chapter'}\n`);

  await fs.ensureDir(outputDir);
  await fs.ensureDir(mediaDir);

  const browser = await chromium.launch({
    headless: !debugMode,
    args: ['--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    // ── Step 1: Login ──
    console.log('→ Logging in...');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle', timeout: 60000 });

    // Try common login selectors
    const loginSelectors = [
      'input[name="username"]', 'input[name="email"]', 'input[type="email"]',
      '#username', '#email', 'input[name="login"]',
    ];
    const passSelectors = [
      'input[name="password"]', 'input[type="password"]',
      '#password',
    ];

    let loginField = null;
    for (const sel of loginSelectors) {
      loginField = await page.$(sel);
      if (loginField) break;
    }

    if (loginField) {
      await loginField.fill(USERNAME);
      let passField = null;
      for (const sel of passSelectors) {
        passField = await page.$(sel);
        if (passField) break;
      }
      if (passField) {
        await passField.fill(PASSWORD);
        // Find and click submit
        const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
        if (submitBtn) await submitBtn.click();
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        console.log('  ✓ Logged in');
      }
    } else {
      console.log('  ⚠ No login form found — may already be logged in or page structure changed');
    }

    // ── Step 2: Navigate to chapter ──
    console.log(`→ Navigating to Chapter ${chapterNum}...`);

    // Try direct URL patterns
    const navUrls = [
      `${BASE_URL}/afm/chapters/chapter-${chapterNum}`,
      `${BASE_URL}/courses/afm/chapter/${chapterNum}`,
      `${BASE_URL}/chapter/${chapterNum}`,
    ];

    let navigated = false;
    for (const url of navUrls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const content = await page.content();
        if (!content.includes('404') && !content.includes('not found')) {
          navigated = true;
          console.log(`  ✓ Navigated to chapter`);
          break;
        }
      } catch {}
    }

    if (!navigated) {
      // Try finding chapter link on the page
      const chapterLink = await page.$(`a:has-text("Chapter ${chapterNum}"), a:has-text("${CHAPTER_TITLES[chapterNum]}")`);
      if (chapterLink) {
        await chapterLink.click();
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        navigated = true;
        console.log('  ✓ Found and clicked chapter link');
      }
    }

    if (!navigated) {
      console.log('  ✗ Could not navigate to chapter. Taking screenshot for debugging...');
      await page.screenshot({ path: path.join(outputDir, 'debug-nav.png') });
    }

    // ── Step 3: Extract pages ──
    console.log('→ Extracting chapter pages...');

    const pages = [];
    let pageNum = 1;
    let imageCount = 0;
    let videoCount = 0;
    const cookies = await getCookies(page);

    // Get total page count if possible
    const pageIndicator = await page.$('.page-indicator, .pagination, [class*="page-count"]');
    let totalPages = null;
    if (pageIndicator) {
      const text = await pageIndicator.textContent();
      const match = text?.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) totalPages = parseInt(match[2]);
    }

    console.log(`  Total pages: ${totalPages || 'unknown (will detect end)'}`);

    // Scrape each page using arrow navigation
    while (true) {
      console.log(`  📄 Page ${pageNum}...`);

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Extract page content
      const pageData = await page.evaluate(() => {
        // Try multiple selectors for the main content area
        const contentSelectors = [
          '.chapter-content', '.page-content', '.content-area',
          'main', '[class*="content"]', '.lesson-content',
          'article', '.study-content',
        ];

        let contentEl = null;
        for (const sel of contentSelectors) {
          contentEl = document.querySelector(sel);
          if (contentEl && contentEl.innerHTML.trim().length > 100) break;
        }

        if (!contentEl) contentEl = document.body;

        // Extract title
        const titleEl = contentEl.querySelector('h1, h2, .page-title, .chapter-title');
        const title = titleEl?.textContent?.trim() || '';

        // Get HTML
        const html = contentEl.innerHTML;

        // Find images
        const images = Array.from(contentEl.querySelectorAll('img')).map(img => ({
          src: img.src || img.getAttribute('data-src') || '',
          alt: img.alt || '',
        })).filter(i => i.src);

        // Find videos
        const videos = Array.from(contentEl.querySelectorAll('video, iframe[src*="video"], [class*="video"]')).map(v => ({
          src: v.src || v.querySelector('source')?.src || '',
        })).filter(v => v.src);

        return { title, html, images, videos };
      });

      // Download images
      const mediaRefs = [];
      for (const img of pageData.images) {
        imageCount++;
        const ext = path.extname(new URL(img.src, 'http://localhost').pathname) || '.png';
        const filename = `img-${String(imageCount).padStart(2, '0')}${ext}`;
        const filepath = path.join(mediaDir, filename);
        const success = await downloadMedia(img.src, filepath, cookies);
        if (success) {
          mediaRefs.push({ originalSrc: img.src, localPath: `./media/${filename}`, type: 'image' });
        }
      }

      // Download videos
      for (const vid of pageData.videos) {
        videoCount++;
        const filename = `video-${String(videoCount).padStart(2, '0')}.mp4`;
        const filepath = path.join(mediaDir, filename);
        const success = await downloadMedia(vid.src, filepath, cookies);
        if (success) {
          mediaRefs.push({ originalSrc: vid.src, localPath: `./media/${filename}`, type: 'video' });
        }
      }

      // Clean HTML
      let cleanedHtml = pageData.html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

      // Replace image srcs with local paths
      for (const ref of mediaRefs) {
        cleanedHtml = cleanedHtml.replace(new RegExp(ref.originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ref.localPath);
      }

      pages.push({
        id: `${chapterId}-p${String(pageNum).padStart(2, '0')}`,
        title: pageData.title || `Page ${pageNum}`,
        contentHtml: cleanedHtml,
        mediaRefs,
      });

      // Move to next page using right arrow
      const hasNext = await page.evaluate(() => {
        const nextBtn = document.querySelector(
          'button[aria-label="Next"], .next-page, [class*="next"], a:has-text("Next")'
        );
        if (nextBtn && !nextBtn.disabled) {
          nextBtn.click();
          return true;
        }
        return false;
      });

      if (hasNext) {
        await page.waitForTimeout(1500);
        pageNum++;
        continue;
      }

      // Try keyboard arrow
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1500);

      // Check if page changed
      const newContent = await page.evaluate(() => {
        const el = document.querySelector('.chapter-content, .page-content, main, [class*="content"]');
        return el?.innerHTML?.substring(0, 200) || '';
      });

      // If we've seen this page before or hit the limit, stop
      if (totalPages && pageNum >= totalPages) break;
      if (pageNum > 50) break; // safety limit

      // Check if the content changed (if not, we've reached the end)
      const prevContent = pages[pages.length - 1]?.contentHtml?.substring(0, 200);
      if (newContent === prevContent) {
        console.log('  ✓ Reached end of chapter (no more pages)');
        break;
      }

      pageNum++;
    }

    // ── Step 4: Extract questions ──
    console.log('→ Extracting practice questions...');
    const questions = [];

    // Try navigating to questions tab
    const qTab = await page.$('button:has-text("Questions"), a:has-text("Questions"), [class*="question"]');
    if (qTab) {
      await qTab.click();
      await page.waitForTimeout(2000);

      const questionData = await page.evaluate(() => {
        const qEls = document.querySelectorAll('.question, [class*="question-item"], [class*="practice"]');
        return Array.from(qEls).map((el, i) => {
          const marksEl = el.querySelector('.marks, [class*="mark"]');
          const answerEl = el.querySelector('.answer, [class*="answer"]');
          return {
            number: i + 1,
            marks: parseInt(marksEl?.textContent?.replace(/\D/g, '') || '0'),
            questionHtml: el.innerHTML,
            officialAnswerHtml: answerEl?.innerHTML || '',
          };
        });
      });

      questionData.forEach((q, i) => {
        questions.push({
          id: `${chapterId}-q${String(i + 1).padStart(2, '0')}`,
          ...q,
          type: 'practice',
        });
      });
    }
    console.log(`  ✓ Found ${questions.length} questions`);

    // ── Step 5: Extract quiz ──
    console.log('→ Extracting quiz questions...');
    const quiz = [];

    const quizTab = await page.$('button:has-text("Quiz"), a:has-text("Quiz"), [class*="quiz"]');
    if (quizTab) {
      await quizTab.click();
      await page.waitForTimeout(2000);

      const quizData = await page.evaluate(() => {
        const qEls = document.querySelectorAll('.quiz-question, [class*="quiz-item"], .mcq');
        return Array.from(qEls).map((el, i) => {
          const optionEls = el.querySelectorAll('.option, [class*="option"], li');
          const options = Array.from(optionEls).map((opt, j) => ({
            label: String.fromCharCode(65 + j),
            text: opt.textContent?.trim() || '',
          }));
          const correctEl = el.querySelector('.correct, [class*="correct"]');
          return {
            questionText: el.querySelector('.question-text, p')?.textContent?.trim() || '',
            options,
            correctIndex: 0,
            officialExplanation: correctEl?.textContent?.trim() || '',
          };
        });
      });

      quizData.forEach((q, i) => {
        quiz.push({ id: `${chapterId}-qz${String(i + 1).padStart(2, '0')}`, ...q });
      });
    }
    console.log(`  ✓ Found ${quiz.length} quiz questions`);

    // ── Step 6: Extract flashcards ──
    console.log('→ Extracting flashcards...');
    const flashcards = [];

    const fcTab = await page.$('button:has-text("Flashcard"), a:has-text("Flashcard"), [class*="flashcard"]');
    if (fcTab) {
      await fcTab.click();
      await page.waitForTimeout(2000);

      const fcData = await page.evaluate(() => {
        const fcEls = document.querySelectorAll('.flashcard, [class*="flashcard-item"], [class*="card"]');
        return Array.from(fcEls).map((el, i) => {
          const frontEl = el.querySelector('.front, [class*="front"]');
          const backEl = el.querySelector('.back, [class*="back"]');
          return {
            front: frontEl?.textContent?.trim() || el.textContent?.trim() || '',
            back: backEl?.textContent?.trim() || '',
          };
        }).filter(f => f.front && f.back);
      });

      fcData.forEach((f, i) => {
        flashcards.push({ id: `${chapterId}-fc${String(i + 1).padStart(2, '0')}`, ...f });
      });
    }
    console.log(`  ✓ Found ${flashcards.length} flashcards`);

    // ── Step 7: Extract mind map ──
    console.log('→ Extracting mind map...');
    let mindmap = null;

    const mmTab = await page.$('button:has-text("Mind Map"), a:has-text("Mind Map"), button:has-text("Mindmap"), a:has-text("Mindmap")');
    if (mmTab) {
      await mmTab.click();
      await page.waitForTimeout(2000);

      mindmap = await page.evaluate(() => {
        const root = document.querySelector('.mindmap, [class*="mind-map"], .tree');
        if (!root) return null;

        function extractNode(el) {
          const label = el.querySelector(':scope > .label, :scope > span, :scope > a')?.textContent?.trim()
            || el.childNodes[0]?.textContent?.trim()
            || '';
          const children = Array.from(el.querySelectorAll(':scope > ul > li, :scope > .children > *'));
          return {
            id: Math.random().toString(36).substr(2, 9),
            label,
            children: children.length > 0 ? children.map(extractNode) : undefined,
          };
        }

        const items = root.querySelectorAll(':scope > li, :scope > ul > li');
        if (items.length === 1) return extractNode(items[0]);

        return {
          id: 'root',
          label: document.querySelector('.chapter-title, h1')?.textContent?.trim() || 'Chapter',
          children: Array.from(items).map(extractNode),
        };
      });
    }
    console.log(`  ✓ Mind map: ${mindmap ? 'found' : 'not found'}`);

    // ── Step 8: Save outputs ──
    console.log('\n→ Saving...');

    const chapterData = {
      id: chapterId,
      title: CHAPTER_TITLES[chapterNum] || `Chapter ${chapterNum}`,
      examWeight: '10%',
      pages,
    };

    await fs.writeJson(path.join(outputDir, 'chapter.json'), chapterData, { spaces: 2 });
    await fs.writeJson(path.join(outputDir, 'questions.json'), questions, { spaces: 2 });
    await fs.writeJson(path.join(outputDir, 'quiz.json'), quiz, { spaces: 2 });
    await fs.writeJson(path.join(outputDir, 'flashcards.json'), flashcards, { spaces: 2 });
    if (mindmap) await fs.writeJson(path.join(outputDir, 'mindmap.json'), mindmap, { spaces: 2 });

    // Update metadata
    const metadataPath = path.join(CONTENT_DIR, 'metadata.json');
    let metadata = {};
    try { metadata = await fs.readJson(metadataPath); } catch {}
    if (!metadata.chapters) metadata.chapters = [];

    const existingIdx = metadata.chapters.findIndex(c => c.id === chapterId);
    const chapterMeta = {
      id: chapterId,
      title: CHAPTER_TITLES[chapterNum],
      examWeight: '10%',
      status: 'scraped',
      scrapedAt: new Date().toISOString(),
      stats: {
        pages: pages.length,
        questions: questions.length,
        quiz: quiz.length,
        flashcards: flashcards.length,
        mindmapNodes: mindmap ? countNodes(mindmap) : 0,
        imagesDownloaded: imageCount,
        videosDownloaded: videoCount,
      },
      aiEnhancementsStatus: 'pending',
    };

    if (existingIdx >= 0) {
      metadata.chapters[existingIdx] = chapterMeta;
    } else {
      metadata.chapters.push(chapterMeta);
    }

    metadata.totalChapters = 18;
    metadata.chaptersScraped = metadata.chapters.filter(c => c.status === 'scraped').length;
    metadata.chapters.sort((a, b) => a.id.localeCompare(b.id));
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });

    // ── Summary ──
    console.log(`\n✅ Chapter ${chapterNum} scraped successfully!\n`);
    console.log(`   Chapter:      ${CHAPTER_TITLES[chapterNum]}`);
    console.log(`   Pages:        ${pages.length}`);
    console.log(`   Questions:    ${questions.length}`);
    console.log(`   Quiz:         ${quiz.length}`);
    console.log(`   Flashcards:   ${flashcards.length}`);
    console.log(`   Mind map:     ${mindmap ? 'yes' : 'no'}`);
    console.log(`   Images:       ${imageCount} downloaded`);
    console.log(`   Videos:       ${videoCount} downloaded`);
    console.log(`\n   Output: ${outputDir}/`);
    console.log(`\n   Next: Refresh http://localhost:3000/chapter/${chapterId}\n`);

  } catch (err) {
    console.error('\n✗ Scraper error:', err.message);
    await page.screenshot({ path: path.join(outputDir, 'error-screenshot.png') });
    console.error('  Screenshot saved to:', path.join(outputDir, 'error-screenshot.png'));
  } finally {
    await browser.close();
  }
}

function countNodes(node) {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

scrapeChapter().catch(console.error);
