// ─────────────────────────────────────────────
// Build Metadata — Rebuilds metadata.json from content/
// Usage: node scripts/build-metadata.js
// ─────────────────────────────────────────────
const fs = require('fs-extra');
const path = require('path');

const CONTENT_DIR = process.env.CONTENT_DIR || './content/chapters';

async function buildMetadata() {
  const dir = path.resolve(process.cwd(), CONTENT_DIR);
  if (!fs.existsSync(dir)) {
    console.log('No content directory found. Run the scraper first.');
    return;
  }

  const chapterDirs = fs.readdirSync(dir)
    .filter(f => f.startsWith('ch') && fs.statSync(path.join(dir, f)).isDirectory())
    .sort();

  const chapters = [];
  let totalPages = 0;

  for (const chDir of chapterDirs) {
    const chPath = path.join(dir, chDir);
    const chapterJson = path.join(chPath, 'chapter.json');

    let chapterData = null;
    try { chapterData = await fs.readJson(chapterJson); } catch {}

    const questionsPath = path.join(chPath, 'questions.json');
    const quizPath = path.join(chPath, 'quiz.json');
    const flashcardsPath = path.join(chPath, 'flashcards.json');
    const mindmapPath = path.join(chPath, 'mindmap.json');

    let questions = [], quiz = [], flashcards = [], mindmap = null;
    try { questions = await fs.readJson(questionsPath); } catch {}
    try { quiz = await fs.readJson(quizPath); } catch {}
    try { flashcards = await fs.readJson(flashcardsPath); } catch {}
    try { mindmap = await fs.readJson(mindmapPath); } catch {}

    const pageCount = chapterData?.pages?.length || 0;
    totalPages += pageCount;

    // Count mindmap nodes
    function countNodes(node) {
      if (!node) return 0;
      if (!node.children || node.children.length === 0) return 1;
      return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
    }

    // Count media files
    const mediaDir = path.join(chPath, 'media');
    let images = 0, videos = 0;
    if (fs.existsSync(mediaDir)) {
      const files = fs.readdirSync(mediaDir);
      images = files.filter(f => /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(f)).length;
      videos = files.filter(f => /\.(mp4|webm|mov)$/i.test(f)).length;
    }

    chapters.push({
      id: chDir,
      title: chapterData?.title || chDir,
      examWeight: chapterData?.examWeight || '10%',
      status: 'scraped',
      scrapedAt: new Date().toISOString(),
      stats: {
        pages: pageCount,
        questions: questions.length,
        quiz: quiz.length,
        flashcards: flashcards.length,
        mindmapNodes: countNodes(mindmap),
        imagesDownloaded: images,
        videosDownloaded: videos,
      },
      aiEnhancementsStatus: 'pending',
    });
  }

  const metadata = {
    totalChapters: 18,
    chaptersScraped: chapters.length,
    chapters,
    totalPages,
    totalPagesExpected: 300,
    progressPercent: Math.round((chapters.length / 18) * 100),
  };

  const outputPath = path.join(dir, 'metadata.json');
  await fs.writeJson(outputPath, metadata, { spaces: 2 });
  console.log(`✓ Metadata rebuilt: ${chapters.length} chapters, ${totalPages} total pages`);
  console.log(`  Written to: ${outputPath}`);
}

buildMetadata().catch(console.error);
