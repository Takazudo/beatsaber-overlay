const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.resolve(__dirname, '..', 'docs');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'category-nav.json');

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function isMarkdownFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ext === '.md' || ext === '.mdx';
}

function isIndexFile(filename, parentDirName) {
  const basename = path.basename(filename, path.extname(filename));
  return basename === 'index' || basename === parentDirName;
}

function filenameToTitle(filename) {
  const basename = path.basename(filename, path.extname(filename));
  return basename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractH1(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function parseMarkdownFile(filePath, categoryKey) {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(rawContent);

  const filename = path.basename(filePath);
  const basenameNoExt = path.basename(filePath, path.extname(filePath));

  const docId = `${categoryKey}/${basenameNoExt}`;

  let title = frontmatter.title || null;
  if (!title) {
    title = extractH1(content);
  }
  if (!title) {
    title = filenameToTitle(filename);
  }

  const position =
    frontmatter.sidebar_position != null
      ? Number(frontmatter.sidebar_position)
      : Infinity;

  return { docId, title, position };
}

function readCategoryMeta(dirPath) {
  const categoryFile = path.join(dirPath, '_category_.json');
  const defaults = {
    label: filenameToTitle(path.basename(dirPath)),
    position: Infinity,
  };

  try {
    const raw = fs.readFileSync(categoryFile, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      label: parsed.label || defaults.label,
      position: parsed.position != null ? Number(parsed.position) : defaults.position,
    };
  } catch {
    return defaults;
  }
}

function findIndexFile(dirPath) {
  const dirName = path.basename(dirPath);
  const entries = fs.readdirSync(dirPath);

  for (const entry of entries) {
    if (!isMarkdownFile(entry)) continue;
    const basename = path.basename(entry, path.extname(entry));
    if (basename === 'index' || basename === dirName) {
      return entry;
    }
  }
  return null;
}

function processCategory(dirPath, categoryKey) {
  const entries = fs.readdirSync(dirPath);
  const dirName = path.basename(dirPath);

  const pages = [];
  const subcategories = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry);

    if (entry === '_category_.json') continue;

    if (isDirectory(entryPath)) {
      if (entry === 'img') continue;

      const subCategoryKey = `${categoryKey}/${entry}`;
      const subMeta = readCategoryMeta(entryPath);
      const subIndexFile = findIndexFile(entryPath);
      const hasIndex = subIndexFile !== null;

      const subDocId = hasIndex
        ? `${subCategoryKey}/${path.basename(subIndexFile, path.extname(subIndexFile))}`
        : subCategoryKey;

      const subEntries = fs.readdirSync(entryPath);
      const subPages = [];

      for (const subEntry of subEntries) {
        const subEntryPath = path.join(entryPath, subEntry);
        if (subEntry === '_category_.json') continue;
        if (isDirectory(subEntryPath)) continue;
        if (!isMarkdownFile(subEntry)) continue;
        if (isIndexFile(subEntry, entry)) continue;

        subPages.push(parseMarkdownFile(subEntryPath, subCategoryKey));
      }

      subPages.sort((a, b) => {
        if (a.position !== b.position) return a.position - b.position;
        return a.title.localeCompare(b.title);
      });

      subcategories.push({
        key: entry,
        title: subMeta.label,
        docId: subDocId,
        hasIndex,
        position: subMeta.position,
        pages: subPages,
      });
    } else if (isMarkdownFile(entry)) {
      if (isIndexFile(entry, dirName)) continue;

      pages.push(parseMarkdownFile(entryPath, categoryKey));
    }
  }

  pages.sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return a.title.localeCompare(b.title);
  });

  subcategories.sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return a.title.localeCompare(b.title);
  });

  return { pages, subcategories };
}

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const topLevelEntries = fs.readdirSync(DOCS_DIR);
  const result = {};

  for (const entry of topLevelEntries) {
    const entryPath = path.join(DOCS_DIR, entry);

    if (!isDirectory(entryPath)) continue;
    if (entry === 'img') continue;

    const categoryData = processCategory(entryPath, entry);
    result[entry] = categoryData;
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2) + '\n', 'utf-8');

  console.log(`Generated ${OUTPUT_FILE}`);
  console.log(`Categories found: ${Object.keys(result).join(', ')}`);
}

main();
