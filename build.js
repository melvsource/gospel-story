// ─────────────────────────────────────────────────────────────
//  build.js — The Gospel Story Library
//  Run: node build.js
//  Output: /output/ folder (push this to GitHub Pages)
// ─────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

// ── 1. THEME CONFIG ──────────────────────────────────────────
//  This is the only place you need to touch to add/remove/rename
//  a theme. The folder must match the slug exactly.
// ─────────────────────────────────────────────────────────────
const THEMES = [
  { slug: '01-creation-and-garden',       title: 'Creation & the Garden',            description: 'God creates all things and dwells with humanity in Eden. The pattern everything else strains toward.' },
  { slug: '02-the-fall',                  title: 'The Fall',                          description: 'Sin enters. The curse falls. And in the same breath, the first promise of a Redeemer is spoken.' },
  { slug: '03-the-flood',                 title: 'The Flood',                         description: 'God judges a broken world — and through the wreckage, preserves a remnant by grace.' },
  { slug: '04-promise-and-patriarchs',    title: 'The Promise & the Patriarchs',      description: 'From Abraham to Joseph, God binds Himself to a people and a line — against every odd.' },
  { slug: '05-the-law',                   title: 'The Law',                           description: 'At Sinai, God reveals His holiness and calls a nation to reflect it. The Law shows the need — and the way.' },
  { slug: '06-the-kingdom',               title: 'The Kingdom',                       description: 'Israel receives kings. Every one of them falls short. The longing for the true King grows.' },
  { slug: '07-exile-and-prophets',        title: 'Exile & the Prophets',              description: 'God disciplines His people — and through the prophets, speaks of a restoration beyond anything they can imagine.' },
  { slug: '08-psalms-and-wisdom',         title: 'Psalms & Wisdom',                   description: 'Poetry, lament, praise, and hard questions — the full range of the human heart laid bare before God.' },
  { slug: '09-messiah-cross-resurrection',title: 'The Messiah, Cross & Resurrection', description: 'Christ enters history. He lives what we could not, dies in our place, and rises — the hinge of all Scripture.' },
  { slug: '10-the-church',                title: 'The Church',                        description: 'The Spirit comes. A people are sent. The Gospel Story now moves outward to every tongue and nation.' },
  { slug: '11-new-creation',              title: 'New Creation',                      description: 'The story does not end in ashes. God restores all things — and the garden becomes a city filled with His glory.' },
  { slug: '12-further-readings',          title: 'Further Readings',                  description: 'Recommended resources, study guides, and materials to go deeper into the Gospel Story.', isMore: true },
];

const CONTENT_DIR = path.join(__dirname, 'content');
const OUTPUT_DIR  = path.join(__dirname, 'output');


// ── 2. HELPERS ────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Minimal frontmatter parser — no dependencies needed
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) meta[key.trim()] = rest.join(':').trim();
  });
  return { meta, body: match[2] };
}

// Minimal Markdown → HTML converter (no dependencies)
// Handles: headings, bold, italic, paragraphs, ul lists, blockquotes, hr
function mdToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Blockquote
    if (line.startsWith('> ')) {
      if (!inBlockquote) { html += '<blockquote>'; inBlockquote = true; }
      html += '<p>' + inline(line.slice(2)) + '</p>';
      continue;
    } else if (inBlockquote) {
      html += '</blockquote>'; inBlockquote = false;
    }

    // Headings
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      if (inList) { html += '</ul>'; inList = false; }
      const level = h[1].length;
      html += `<h${level}>${inline(h[2])}</h${level}>`;
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      html += '<hr>';
      continue;
    }

    // List item
    if (line.match(/^[-*]\s+/)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`;
      continue;
    } else if (inList) {
      html += '</ul>'; inList = false;
    }

    // Paragraph
    if (line.trim() === '') continue;
    html += `<p>${inline(line)}</p>`;
  }

  if (inList) html += '</ul>';
  if (inBlockquote) html += '</blockquote>';
  return html;
}

function inline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`(.+?)`/g,       '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

// ── 3. SHARED HTML PARTS ──────────────────────────────────────

const CSS = `
<style>
:root {
  --navy:       #1A2744;
  --navy-light: #253560;
  --gold:       #B8952A;
  --gold-light: #D4AE4E;
  --parchment:  #F7F0E2;
  --cream:      #FDFAF4;
  --slate:      #7A8BA0;
  --text:       #2C2C2C;
  --text-muted: #5A5A5A;
  --rule:       #D9CEB5;
  --font-display: 'Cinzel', Georgia, serif;
  --font-body:    'EB Garamond', Georgia, serif;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: var(--cream); color: var(--text); font-family: var(--font-body); font-size: 1.125rem; line-height: 1.85; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
.container { max-width: 780px; margin-inline: auto; padding-inline: 1.5rem; }
.container--wide { max-width: 1100px; margin-inline: auto; padding-inline: 1.5rem; }
.eyebrow { font-family: var(--font-display); font-size: 0.58rem; font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 0.75rem; }
.ornament { display: flex; align-items: center; gap: 1rem; margin-block: 0.5rem 2rem; }
.ornament::before, .ornament::after { content: ''; flex: 1; height: 1px; background: var(--rule); }
.ornament span { color: var(--gold); font-size: 0.9rem; }
.btn { display: inline-block; font-family: var(--font-display); font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; padding: 0.85rem 2rem; cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: var(--gold); color: var(--navy); font-weight: 700; }
.btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); }
.btn-navy { background: var(--navy); color: #fff; }
.btn-navy:hover { background: var(--navy-light); transform: translateY(-1px); }

/* NAV */
.site-nav { background: var(--navy); position: sticky; top: 0; z-index: 100; border-bottom: 1px solid rgba(255,255,255,0.06); }
.site-nav .inner { max-width: 1100px; margin-inline: auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.site-nav .brand { font-family: var(--font-display); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); white-space: nowrap; }
.nav-links { display: flex; list-style: none; gap: 2rem; }
.nav-links a { font-family: var(--font-display); font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.65); transition: color 0.2s; }
.nav-links a:hover, .nav-links a.active { color: var(--gold-light); }
.nav-toggle { display: none; background: none; border: none; color: rgba(255,255,255,0.7); font-size: 1.2rem; cursor: pointer; }

/* PAGE HERO */
.page-hero { background: var(--navy); background-image: linear-gradient(170deg, #1A2744 0%, #0F1A33 100%); padding-block: 4rem 3.5rem; text-align: center; }
.page-hero h1 { font-family: var(--font-display); font-size: clamp(1.7rem, 4vw, 2.6rem); font-weight: 700; color: #fff; letter-spacing: 0.05em; line-height: 1.2; margin-bottom: 0.75rem; }
.page-hero p { font-size: 1rem; color: rgba(255,255,255,0.5); font-style: italic; max-width: 500px; margin-inline: auto; }

/* LIBRARY GRID */
.library-section { padding: 3.5rem 1.5rem 5rem; }
.library-intro { text-align: center; max-width: 580px; margin-inline: auto; margin-bottom: 3rem; }
.library-intro h2 { font-family: var(--font-display); font-size: clamp(1.1rem, 2.5vw, 1.4rem); font-weight: 600; color: var(--navy); letter-spacing: 0.04em; margin-bottom: 0.5rem; }
.library-intro p { font-size: 0.95rem; color: var(--text-muted); font-style: italic; }
.theme-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
.theme-card { background: #fff; border: 1px solid var(--rule); padding: 1.75rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 0.6rem; transition: border-color 0.2s, transform 0.2s; }
.theme-card:hover { border-color: var(--gold); transform: translateY(-2px); }
.theme-card.card-more { background: var(--navy); border-color: var(--navy); }
.theme-card.card-more:hover { border-color: var(--gold); }
.card-number { font-family: var(--font-display); font-size: 0.52rem; letter-spacing: 0.2em; color: var(--gold); margin-bottom: 0.25rem; }
.card-more .card-number { color: rgba(255,255,255,0.3); }
.card-title { font-family: var(--font-display); font-size: 0.82rem; font-weight: 600; color: var(--navy); letter-spacing: 0.04em; line-height: 1.4; }
.card-more .card-title { color: var(--gold-light); }
.card-desc { font-size: 0.88rem; color: var(--text-muted); line-height: 1.65; font-style: italic; flex: 1; }
.card-more .card-desc { color: rgba(255,255,255,0.45); }
.card-rule { height: 1px; background: var(--rule); margin-top: auto; margin-bottom: 0.75rem; }
.card-more .card-rule { background: rgba(255,255,255,0.1); }
.card-link { font-family: var(--font-display); font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); display: inline-block; transition: letter-spacing 0.2s; }
.theme-card:hover .card-link { letter-spacing: 0.24em; }
.card-more .card-link { color: rgba(255,255,255,0.5); }
.card-more:hover .card-link { color: var(--gold-light); }

/* ARTICLE LIST (theme index page) */
.theme-hero { background: var(--navy); background-image: linear-gradient(170deg, #1A2744 0%, #0F1A33 100%); padding-block: 3.5rem 3rem; }
.theme-hero .back { font-family: var(--font-display); font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.4); display: inline-block; margin-bottom: 1.25rem; transition: color 0.2s; }
.theme-hero .back:hover { color: var(--gold-light); }
.theme-hero h1 { font-family: var(--font-display); font-size: clamp(1.5rem, 3.5vw, 2.2rem); font-weight: 700; color: #fff; letter-spacing: 0.05em; line-height: 1.2; margin-bottom: 0.6rem; }
.theme-hero p { font-size: 0.98rem; color: rgba(255,255,255,0.5); font-style: italic; max-width: 540px; }
.article-list { padding-block: 3.5rem 5rem; }
.article-item { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 1.5rem; padding-block: 1.5rem; border-bottom: 1px solid var(--rule); transition: background 0.15s; }
.article-item:first-child { border-top: 1px solid var(--rule); }
.article-item:hover { background: var(--parchment); margin-inline: -1.5rem; padding-inline: 1.5rem; }
.article-item h3 { font-family: var(--font-display); font-size: 0.9rem; font-weight: 600; color: var(--navy); letter-spacing: 0.03em; margin-bottom: 0.3rem; }
.article-item p { font-size: 0.88rem; color: var(--text-muted); font-style: italic; line-height: 1.6; }
.article-arrow { font-family: var(--font-display); font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); white-space: nowrap; }

/* ARTICLE PAGE */
.article-body { padding-block: 3.5rem 5rem; }
.article-body h1 { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; color: var(--navy); letter-spacing: 0.04em; line-height: 1.3; margin-bottom: 0.5rem; }
.article-body h2 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; color: var(--navy); letter-spacing: 0.04em; margin-top: 2.5rem; margin-bottom: 0.75rem; }
.article-body h3 { font-family: var(--font-display); font-size: 0.9rem; font-weight: 600; color: var(--navy); letter-spacing: 0.03em; margin-top: 2rem; margin-bottom: 0.5rem; }
.article-body p { margin-bottom: 1.25rem; color: var(--text); }
.article-body ul { padding-left: 1.5rem; margin-bottom: 1.25rem; }
.article-body li { margin-bottom: 0.4rem; color: var(--text); }
.article-body blockquote { border-left: 3px solid var(--gold); padding-left: 1.25rem; margin-block: 1.5rem; }
.article-body blockquote p { font-style: italic; color: var(--text-muted); margin-bottom: 0; }
.article-body strong { font-weight: 600; color: var(--navy); }
.article-body em { font-style: italic; }
.article-body hr { border: none; border-top: 1px solid var(--rule); margin-block: 2rem; }
.article-nav { display: flex; justify-content: space-between; gap: 1rem; padding-top: 2.5rem; border-top: 1px solid var(--rule); margin-top: 3rem; }
.article-nav a { font-family: var(--font-display); font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); transition: color 0.2s; }
.article-nav a:hover { color: var(--gold-light); }

/* SUPPORT BAND */
.support-band { background: var(--parchment); padding-block: 3.5rem; text-align: center; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.support-band p { font-style: italic; color: var(--text-muted); max-width: 480px; margin-inline: auto; margin-bottom: 1.5rem; font-size: 0.95rem; }

/* FOOTER */
.site-footer { background: var(--navy); border-top: 1px solid rgba(255,255,255,0.06); padding-block: 3rem; }
.site-footer .inner { max-width: 1100px; margin-inline: auto; padding-inline: 1.5rem; display: grid; grid-template-columns: 1fr auto 1fr; align-items: start; gap: 2rem; }
.footer-brand .brand { font-family: var(--font-display); font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 0.5rem; }
.footer-brand p { font-size: 0.82rem; color: rgba(255,255,255,0.3); font-style: italic; line-height: 1.7; }
.footer-nav { display: flex; flex-direction: column; gap: 0.6rem; align-items: center; }
.footer-nav a { font-family: var(--font-display); font-size: 0.57rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.45); transition: color 0.2s; }
.footer-nav a:hover { color: var(--gold-light); }
.footer-legal { text-align: right; }
.footer-legal nav { display: flex; gap: 1.25rem; justify-content: flex-end; margin-bottom: 0.75rem; flex-wrap: wrap; }
.footer-legal nav a { font-family: var(--font-display); font-size: 0.53rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.3); transition: color 0.2s; }
.footer-legal nav a:hover { color: var(--gold-light); }
.footer-legal p { font-size: 0.78rem; color: rgba(255,255,255,0.22); }

.reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.55s ease, transform 0.55s ease; }
.reveal.visible { opacity: 1; transform: none; }

@media (max-width: 900px) { .theme-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px) {
  .theme-grid { grid-template-columns: repeat(2, 1fr); }
  .nav-toggle { display: block; }
  .nav-links { display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--navy); flex-direction: column; gap: 0; padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
  .nav-links.open { display: flex; }
  .nav-links li { padding-block: 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .site-nav { position: relative; }
  .site-footer .inner { grid-template-columns: 1fr; }
  .footer-legal { text-align: left; }
  .footer-legal nav { justify-content: flex-start; }
}
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
</style>`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet">`;

function nav(activeSlug = '') {
  const links = [
    { href: '../../',           label: 'Home'    },
    { href: '../../library/',   label: 'Library' },
    { href: '../../books/',     label: 'Books'   },
    { href: '../../resources/', label: 'Resources' },
    { href: '../../about/',     label: 'About'   },
  ];
  return `
<nav class="site-nav" aria-label="Site navigation">
  <div class="inner">
    <a href="../../" class="brand">The Gospel Story</a>
    <button class="nav-toggle" aria-label="Toggle navigation" onclick="this.nextElementSibling.classList.toggle('open')">☰</button>
    <ul class="nav-links">
      ${links.map(l => `<li><a href="${l.href}"${l.label.toLowerCase() === activeSlug ? ' class="active"' : ''}>${l.label}</a></li>`).join('\n      ')}
    </ul>
  </div>
</nav>`;
}

function footer() {
  return `
<footer class="site-footer">
  <div class="inner">
    <div class="footer-brand">
      <span class="brand">The Gospel Story</span>
      <p>Helping believers and seekers<br>understand Scripture as one<br>unified story centered on Christ.</p>
    </div>
    <nav class="footer-nav" aria-label="Footer navigation">
      <a href="../../">Home</a>
      <a href="../../library/">Library</a>
      <a href="../../books/">Books</a>
      <a href="../../resources/">Resources</a>
      <a href="../../about/">About</a>
    </nav>
    <div class="footer-legal">
      <nav>
        <a href="https://www.amazon.com/stores/Melvin-Perez-Maghari-Jr/author/B0GT7JHP1Y" target="_blank" rel="noopener">Amazon Author Page</a>
        <a href="../../privacy/">Privacy</a>
      </nav>
      <p>© 2026 The Gospel Story. All rights reserved.</p>
    </div>
  </div>
</footer>
<script>
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
  { threshold: 0.1 }
);
reveals.forEach(el => obs.observe(el));
</script>`;
}

function supportBand() {
  return `
<div class="support-band">
  <div class="container">
    <div class="ornament"><span>✦</span></div>
    <p>This library is offered freely. If the Gospel Story has helped you understand Scripture, you are welcome to support the work.</p>
    <a href="https://www.paypal.com/ncp/payment/J6MDREWJPG4PY" target="_blank" rel="noopener" class="btn btn-primary">Support This Ministry</a>
  </div>
</div>`;
}


// ── 4. BUILD LIBRARY INDEX ────────────────────────────────────

function buildLibraryIndex() {
  const cards = THEMES.map((theme, i) => {
    const num = theme.isMore ? 'Further' : String(i + 1).padStart(2, '0');
    const cardClass = theme.isMore ? 'theme-card card-more' : 'theme-card';
    const linkText  = theme.isMore ? 'Explore →' : 'Read →';
    return `
      <a href="./${theme.slug}/" class="${cardClass} reveal">
        <div class="card-number">${num}</div>
        <div class="card-title">${theme.title}</div>
        <div class="card-desc">${theme.description}</div>
        <div class="card-rule"></div>
        <span class="card-link">${linkText}</span>
      </a>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Library — The Gospel Story</title>
<meta name="description" content="Twelve threads woven through all 66 books of Scripture — follow any one and find Christ at the center.">
${FONTS}
${CSS}
</head>
<body>
${nav('library')}

<header class="page-hero">
  <div>
    <span class="eyebrow">Scripture · Christ · One Story</span>
    <h1>The Library</h1>
    <p>Twelve threads woven through all 66 books — follow any one and find Christ at the center.</p>
  </div>
</header>

<main class="library-section container--wide">
  <div class="library-intro">
    <h2>Choose a Theme</h2>
    <p>Each thread traces one movement of the one Gospel Story — from the first word of Genesis to the last word of Revelation.</p>
  </div>
  <div class="theme-grid">${cards}
  </div>
</main>

${supportBand()}
${footer()}
</body>
</html>`;

  const outDir = path.join(OUTPUT_DIR, 'library');
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log('✓  library/index.html');
}


// ── 5. BUILD THEME INDEX (article list) ──────────────────────

function buildThemeIndex(theme, articles) {
  const articleItems = articles.map(article => `
        <a href="./${article.slug}/" class="article-item reveal">
          <div>
            <h3>${article.meta.title || article.slug}</h3>
            ${article.meta.description ? `<p>${article.meta.description}</p>` : ''}
          </div>
          <span class="article-arrow">Read →</span>
        </a>`).join('');

  const empty = articles.length === 0
    ? `<p style="color:var(--text-muted); font-style:italic; padding-top:2rem;">
        Articles coming soon. Check back or <a href="../../about/" style="color:var(--gold);">follow the work</a>.
       </p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${theme.title} — The Gospel Story</title>
<meta name="description" content="${theme.description}">
${FONTS}
${CSS}
</head>
<body>
${nav('library')}

<header class="theme-hero">
  <div class="container">
    <a href="../../library/" class="back">← The Library</a>
    <h1>${theme.title}</h1>
    <p>${theme.description}</p>
  </div>
</header>

<main class="article-list container">
  ${articleItems || empty}
</main>

${supportBand()}
${footer()}
</body>
</html>`;

  const outDir = path.join(OUTPUT_DIR, 'library', theme.slug);
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log(`✓  library/${theme.slug}/index.html  (${articles.length} article${articles.length !== 1 ? 's' : ''})`);
}


// ── 6. BUILD INDIVIDUAL ARTICLE ───────────────────────────────

function buildArticle(theme, article, prev, next) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${article.meta.title || article.slug} — The Gospel Story</title>
${article.meta.description ? `<meta name="description" content="${article.meta.description}">` : ''}
${FONTS}
${CSS}
</head>
<body>
${nav('library')}

<header class="theme-hero">
  <div class="container">
    <a href="../" class="back">← ${theme.title}</a>
  </div>
</header>

<main class="article-body container">
  ${mdToHtml(article.body)}

  <nav class="article-nav" aria-label="Article navigation">
    <span>${prev ? `<a href="../${prev.slug}/">← ${prev.meta.title || prev.slug}</a>` : ''}</span>
    <a href="../">All Articles</a>
    <span>${next ? `<a href="../${next.slug}/">${next.meta.title || next.slug} →</a>` : ''}</span>
  </nav>
</main>

${supportBand()}
${footer()}
</body>
</html>`;

  const outDir = path.join(OUTPUT_DIR, 'library', theme.slug, article.slug);
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log(`   ↳  ${article.slug}/index.html`);
}


// ── 7. MAIN ───────────────────────────────────────────────────

function build() {
  console.log('\nBuilding The Gospel Story Library...\n');
  ensureDir(OUTPUT_DIR);

  buildLibraryIndex();

  for (const theme of THEMES) {
    const themeDir = path.join(CONTENT_DIR, theme.slug);

    if (!fs.existsSync(themeDir)) {
      buildThemeIndex(theme, []);
      continue;
    }

    // Load and sort all .md files in this theme folder
    const files = fs.readdirSync(themeDir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const raw  = fs.readFileSync(path.join(themeDir, f), 'utf8');
        const { meta, body } = parseFrontmatter(raw);
        return { slug: f.replace(/\.md$/, ''), meta, body, filename: f };
      })
      .sort((a, b) => (Number(a.meta.order) || 999) - (Number(b.meta.order) || 999));

    buildThemeIndex(theme, files);

    files.forEach((article, i) => {
      buildArticle(theme, article, files[i - 1] || null, files[i + 1] || null);
    });
  }

  console.log('\n✓  Build complete → output/\n');
}

build();