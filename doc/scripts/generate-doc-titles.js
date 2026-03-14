const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.resolve(__dirname, '..', 'docs');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'doc-titles.json');

function findMarkdownFiles(dir, basePath = '') {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      if (entry.name !== 'img' && entry.name !== 'node_modules') {
        results.push(...findMarkdownFiles(fullPath, relativePath));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.md' || ext === '.mdx') {
        results.push({ fullPath, relativePath });
      }
    }
  }

  return results;
}

function extractTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: body } = matter(content);

  if (frontmatter.title) {
    return frontmatter.title;
  }

  if (frontmatter.sidebar_label) {
    return frontmatter.sidebar_label;
  }

  const h1Match = body.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].replace(/\*\*/g, '').replace(/\*/g, '').trim();
  }

  const basename = path.basename(filePath);
  const nameWithoutExt = basename.replace(/\.(md|mdx)$/i, '');
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function pathToDocId(relativePath) {
  return relativePath
    .replace(/\.(md|mdx)$/i, '')
    .split(path.sep)
    .join('/');
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`Error: docs directory not found at ${DOCS_DIR}`);
    process.exit(1);
  }

  const files = findMarkdownFiles(DOCS_DIR);

  const titles = {};
  for (const { fullPath, relativePath } of files) {
    const docId = pathToDocId(relativePath);
    const title = extractTitle(fullPath);
    titles[docId] = title;
  }

  const sorted = {};
  for (const key of Object.keys(titles).sort()) {
    sorted[key] = titles[key];
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log(`Generated ${OUTPUT_FILE} with ${Object.keys(sorted).length} entries.`);
}

main();
