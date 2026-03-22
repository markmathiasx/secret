#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const { spawnSync } = require('node:child_process');

const ROOT_DIR = process.cwd();
const PRIMARY_DATA_DIR = path.join(ROOT_DIR, 'src', 'data');
const SECONDARY_DATA_DIR = path.join(ROOT_DIR, 'data');
const PUBLIC_IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images');
const LOG_FILE = path.join(ROOT_DIR, 'fillImages.log.csv');
const REQUIRED_DEPENDENCIES = ['puppeteer', 'cheerio', 'csv-stringify'];
const REQUEST_TIMEOUT_MS = 30_000;
const DOWNLOAD_RETRIES = 3;
const SEARCH_RETRIES = 3;
const MIN_PIXELS = 1_000_000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
const DEFAULT_HEADERS = {
  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'cache-control': 'no-cache',
  pragma: 'no-cache',
  referer: 'https://duckduckgo.com/',
  'user-agent': USER_AGENT,
};
const IGNORE_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  '.vercel',
  'build',
  'dist',
  'node_modules',
  'out',
  'output',
  'public',
]);

let cheerio;
let stringifyCsv;
let puppeteer;

main().catch(() => {
  console.log('erros = 1');
  process.exitCode = 1;
});

async function main() {
  await ensureDependencies();
  cheerio = require('cheerio');
  ({ stringify: stringifyCsv } = require('csv-stringify/sync'));
  puppeteer = require('puppeteer');

  await ensureDirectory(PUBLIC_IMAGES_DIR);

  const catalogFiles = findCatalogFiles();
  const logRows = [];
  let errorCount = 0;

  if (catalogFiles.length === 0) {
    await writeCsvLog(logRows);
    console.log('imagens pendentes = 0');
    return;
  }

  const browser = await launchBrowser();

  try {
    for (const filePath of catalogFiles) {
      let sourceText = '';
      let parsedJson;
      let indent = '  ';
      let newline = '\n';
      let bom = '';

      try {
        sourceText = await fs.promises.readFile(filePath, 'utf8');
        bom = sourceText.startsWith('\uFEFF') ? '\uFEFF' : '';
        const normalizedText = sourceText.replace(/^\uFEFF/, '');
        indent = detectIndent(normalizedText);
        newline = detectNewline(normalizedText);
        parsedJson = JSON.parse(normalizedText);
      } catch {
        errorCount += 1;
        logRows.push({
          id: '',
          descricao: path.basename(filePath),
          status: 'erro_json',
          url: '',
        });
        continue;
      }

      const pendingProducts = collectPendingProducts(parsedJson);
      if (pendingProducts.length === 0) {
        continue;
      }

      let fileMutated = false;

      for (const product of pendingProducts) {
        const description = getDescription(product);
        const id = stringifyValue(product.id ?? product.sku ?? product.codigo ?? product.code ?? '');
        const query = buildSearchQuery(id, description);
        const slug = slugify([id, description].filter(Boolean).join(' ')) || `item-${Date.now()}`;

        try {
          const result = await resolveProductImage(browser, query, slug);
          product.image = result.relativeUrl;
          fileMutated = true;
          logRows.push({
            id,
            descricao: description,
            status: 'ok',
            url: result.relativeUrl,
          });
        } catch {
          errorCount += 1;
          logRows.push({
            id,
            descricao: description,
            status: 'erro',
            url: '',
          });
        }
      }

      if (fileMutated) {
        const nextText = bom + JSON.stringify(parsedJson, null, indent) + newline;
        await fs.promises.writeFile(filePath, nextText, 'utf8');
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  await writeCsvLog(logRows);

  if (errorCount === 0) {
    console.log('imagens pendentes = 0');
  } else {
    console.log(`erros = ${errorCount}`);
    process.exitCode = 1;
  }
}

async function ensureDependencies() {
  const missing = REQUIRED_DEPENDENCIES.filter((pkgName) => !hasModule(pkgName));
  if (missing.length === 0) {
    return;
  }

  const installEnv = { ...process.env };

  if (findBrowserExecutable()) {
    installEnv.PUPPETEER_SKIP_DOWNLOAD = installEnv.PUPPETEER_SKIP_DOWNLOAD || '1';
  }

  const commands = process.platform === 'win32'
    ? [
        { command: 'npm.cmd', args: ['install', '--no-save', '--silent', ...missing] },
        { command: 'cmd.exe', args: ['/c', 'npm', 'install', '--no-save', '--silent', ...missing] },
      ]
    : [
        { command: 'npm', args: ['install', '--no-save', '--silent', ...missing] },
      ];

  let installed = false;

  for (const entry of commands) {
    const installResult = spawnSync(entry.command, entry.args, {
      cwd: ROOT_DIR,
      env: installEnv,
      stdio: 'inherit',
    });

    if (installResult.status === 0) {
      installed = true;
      break;
    }
  }

  if (!installed) {
    throw new Error('Falha ao instalar dependencias.');
  }
}

function hasModule(pkgName) {
  try {
    require.resolve(pkgName, { paths: [ROOT_DIR] });
    return true;
  } catch {
    return false;
  }
}

function findCatalogFiles() {
  const directMatches = [
    ...listCatalogFilesInDir(PRIMARY_DATA_DIR),
    ...listCatalogFilesInDir(SECONDARY_DATA_DIR),
  ];

  if (directMatches.length > 0) {
    return Array.from(new Set(directMatches)).sort();
  }

  return walkForCatalogFiles(ROOT_DIR).sort();
}

function listCatalogFilesInDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^catalogo-.*\.json$/i.test(entry.name))
    .map((entry) => path.join(dirPath, entry.name));
}

function walkForCatalogFiles(dirPath) {
  const matches = [];
  const stack = [dirPath];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    let entries = [];

    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) {
          stack.push(entryPath);
        }
        continue;
      }

      if (entry.isFile() && /^catalogo-.*\.json$/i.test(entry.name)) {
        matches.push(entryPath);
      }
    }
  }

  return matches;
}

function collectPendingProducts(rootNode) {
  const pending = [];

  visitNode(rootNode, (node) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      return;
    }

    if (!isProductLike(node)) {
      return;
    }

    if (!isMissingImage(node.image)) {
      return;
    }

    pending.push(node);
  });

  return pending;
}

function visitNode(node, visitor) {
  if (Array.isArray(node)) {
    for (const item of node) {
      visitNode(item, visitor);
    }
    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  visitor(node);

  for (const value of Object.values(node)) {
    visitNode(value, visitor);
  }
}

function isProductLike(node) {
  const hasId = hasFilledValue(node.id) || hasFilledValue(node.sku) || hasFilledValue(node.codigo) || hasFilledValue(node.code);
  const hasDescription = hasFilledValue(getDescription(node));
  return hasId && hasDescription;
}

function getDescription(node) {
  const fields = [
    node.descricao,
    node.description,
    node.nome,
    node.name,
    node.titulo,
    node.title,
  ];

  for (const field of fields) {
    if (hasFilledValue(field)) {
      return stringifyValue(field);
    }
  }

  return '';
}

function buildSearchQuery(id, description) {
  return [id, description].filter(Boolean).join(' ').trim();
}

function isMissingImage(imageValue) {
  if (typeof imageValue === 'undefined') {
    return true;
  }

  if (imageValue === null) {
    return true;
  }

  if (typeof imageValue !== 'string') {
    return true;
  }

  return imageValue.trim() === '';
}

function hasFilledValue(value) {
  return stringifyValue(value).trim().length > 0;
}

function stringifyValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }

  return '';
}

async function launchBrowser() {
  const executablePath = findBrowserExecutable();
  const launchOptions = {
    headless: true,
    defaultViewport: { width: 1600, height: 900 },
    ignoreHTTPSErrors: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-first-run',
      '--no-default-browser-check',
      '--lang=pt-BR',
    ],
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  } else if (process.platform === 'win32') {
    launchOptions.channel = 'chrome';
  }

  return puppeteer.launch(launchOptions);
}

function findBrowserExecutable() {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const localAppData = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.PROGRAMFILES || '';
  const programFilesX86 = process.env['PROGRAMFILES(X86)'] || '';

  const candidates = process.platform === 'win32'
    ? [
        path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      ]
    : process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        ]
      : [
          '/usr/bin/google-chrome-stable',
          '/usr/bin/google-chrome',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium',
          '/snap/bin/chromium',
          path.join(homeDir, '.cache', 'puppeteer', 'chrome', 'chrome'),
        ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return '';
}

async function resolveProductImage(browser, query, slug) {
  const candidates = await searchDuckDuckGoImages(browser, query);
  if (candidates.length === 0) {
    throw new Error('Nenhuma imagem candidata encontrada.');
  }

  for (const candidateUrl of candidates) {
    try {
      return await downloadAndPersistImage(candidateUrl, slug);
    } catch {
      continue;
    }
  }

  throw new Error('Nenhuma imagem valida encontrada.');
}

async function searchDuckDuckGoImages(browser, query) {
  let lastError = null;

  for (let attempt = 1; attempt <= SEARCH_RETRIES; attempt += 1) {
    const page = await browser.newPage();
    const networkCandidates = [];
    const seenNetworkCandidates = new Set();

    const responseHandler = async (response) => {
      const responseUrl = response.url();
      if (!/duckduckgo\.com\/i\.js/i.test(responseUrl)) {
        return;
      }

      try {
        const bodyText = await response.text();
        const payload = JSON.parse(bodyText);
        for (const url of extractCandidatesFromDuckResponse(payload)) {
          if (!seenNetworkCandidates.has(url)) {
            seenNetworkCandidates.add(url);
            networkCandidates.push(url);
          }
        }
      } catch {
        // noop
      }
    };

    try {
      await preparePage(page);
      page.on('response', responseHandler);

      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: REQUEST_TIMEOUT_MS });
      await delay(1_250);
      await dismissOverlays(page);
      await page.mouse.wheel({ deltaY: 1_200 });
      await delay(450);
      await page.mouse.wheel({ deltaY: 1_600 });
      await delay(900);

      const html = await page.content();
      const blocked = looksBlocked(html);
      const vqd = extractVqd(html);

      const apiCandidates = vqd ? await fetchCandidatesViaPage(page, query, vqd) : [];
      const domCandidates = extractCandidatesFromHtml(html);
      const candidates = dedupeUrls([...networkCandidates, ...apiCandidates, ...domCandidates]);

      if (candidates.length > 0) {
        return candidates;
      }

      if (blocked) {
        throw new Error('Busca bloqueada pelo provedor.');
      }

      throw new Error('Busca sem resultados utilizaveis.');
    } catch (error) {
      lastError = error;
      await delay(800 * attempt);
    } finally {
      page.off('response', responseHandler);
      await page.close().catch(() => {});
    }
  }

  throw lastError || new Error('Falha ao buscar imagens.');
}

async function preparePage(page) {
  await page.setUserAgent(USER_AGENT);
  await page.setExtraHTTPHeaders(DEFAULT_HEADERS);
  await page.setBypassCSP(true);
  await page.setJavaScriptEnabled(true);
  page.setDefaultNavigationTimeout(REQUEST_TIMEOUT_MS);
  page.setDefaultTimeout(REQUEST_TIMEOUT_MS);

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get() {
        return undefined;
      },
    });

    Object.defineProperty(navigator, 'languages', {
      get() {
        return ['pt-BR', 'pt', 'en-US', 'en'];
      },
    });

    Object.defineProperty(navigator, 'plugins', {
      get() {
        return [1, 2, 3, 4, 5];
      },
    });

    const originalQuery = window.navigator.permissions && window.navigator.permissions.query;
    if (typeof originalQuery === 'function') {
      window.navigator.permissions.query = (parameters) => {
        if (parameters && parameters.name === 'notifications') {
          return Promise.resolve({ state: Notification.permission });
        }
        return originalQuery(parameters);
      };
    }
  });
}

async function dismissOverlays(page) {
  const selectors = [
    'button[aria-label="Close"]',
    'button[aria-label="Fechar"]',
    'button[aria-label="Dismiss"]',
    'button:has-text("Accept")',
    'button:has-text("Aceitar")',
  ];

  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.click().catch(() => {});
      }
    } catch {
      // noop
    }
  }

  await page.keyboard.press('Escape').catch(() => {});
}

function looksBlocked(html) {
  const normalized = String(html || '').toLowerCase();
  return (
    normalized.includes('complete the following challenge') ||
    normalized.includes('unexpected error') ||
    normalized.includes('anomaly') ||
    normalized.includes('automated traffic') ||
    normalized.includes('are you human')
  );
}

function extractVqd(html) {
  const patterns = [
    /vqd=['"]([^'"]+)['"]/i,
    /"vqd"\s*:\s*"([^"]+)"/i,
    /vqd=([0-9-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = String(html || '').match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}

async function fetchCandidatesViaPage(page, query, vqd) {
  try {
    const payload = await page.evaluate(
      async ({ searchQuery, searchVqd }) => {
        const params = new URLSearchParams({
          l: 'br-pt',
          o: 'json',
          q: searchQuery,
          vqd: searchVqd,
          f: ',,,',
          p: '1',
        });

        try {
          const response = await fetch(`https://duckduckgo.com/i.js?${params.toString()}`, {
            credentials: 'include',
            headers: {
              accept: 'application/json, text/javascript, */*; q=0.01',
              'x-requested-with': 'XMLHttpRequest',
            },
          });

          return {
            ok: response.ok,
            status: response.status,
            body: await response.text(),
          };
        } catch (error) {
          return {
            ok: false,
            status: 0,
            body: String(error),
          };
        }
      },
      { searchQuery: query, searchVqd: vqd },
    );

    if (!payload.ok) {
      return [];
    }

    const parsed = JSON.parse(payload.body);
    return extractCandidatesFromDuckResponse(parsed);
  } catch {
    return [];
  }
}

function extractCandidatesFromDuckResponse(payload) {
  if (!payload || !Array.isArray(payload.results)) {
    return [];
  }

  const urls = [];

  for (const entry of payload.results) {
    const candidates = [entry.image, entry.thumbnail, entry.url];
    for (const candidate of candidates) {
      const normalized = normalizeCandidateUrl(candidate);
      if (normalized) {
        urls.push(normalized);
      }
    }
  }

  return dedupeUrls(urls);
}

function extractCandidatesFromHtml(html) {
  const $ = cheerio.load(html);
  const urls = [];

  $('img, a, source, meta').each((_, element) => {
    const attributes = [
      'src',
      'data-src',
      'data-image',
      'data-srcset',
      'srcset',
      'href',
      'content',
    ];

    for (const attribute of attributes) {
      const rawValue = $(element).attr(attribute);
      if (!rawValue) {
        continue;
      }

      if (attribute.includes('srcset')) {
        for (const srcsetValue of rawValue.split(',')) {
          const candidate = normalizeCandidateUrl(srcsetValue.trim().split(/\s+/)[0]);
          if (candidate) {
            urls.push(candidate);
          }
        }
        continue;
      }

      const candidate = normalizeCandidateUrl(rawValue);
      if (candidate) {
        urls.push(candidate);
      }
    }
  });

  return dedupeUrls(urls);
}

function normalizeCandidateUrl(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') {
    return '';
  }

  let candidate = rawValue.trim();
  if (!candidate || candidate.startsWith('data:') || candidate.startsWith('blob:')) {
    return '';
  }

  if (candidate.startsWith('//')) {
    candidate = `https:${candidate}`;
  }

  try {
    const candidateUrl = new URL(candidate, 'https://duckduckgo.com/');

    const directImage = candidateUrl.searchParams.get('u') || candidateUrl.searchParams.get('uddg');
    if (directImage) {
      return normalizeCandidateUrl(decodeURIComponent(directImage));
    }

    if (!['http:', 'https:'].includes(candidateUrl.protocol)) {
      return '';
    }

    if (
      candidateUrl.hostname.includes('duckduckgo.com') &&
      !candidateUrl.hostname.includes('external-content.duckduckgo.com')
    ) {
      const pathname = candidateUrl.pathname.toLowerCase();
      if (!pathname.endsWith('.jpg') && !pathname.endsWith('.jpeg') && !pathname.endsWith('.png')) {
        return '';
      }
    }

    return candidateUrl.toString();
  } catch {
    return '';
  }
}

function dedupeUrls(urls) {
  const seen = new Set();
  const deduped = [];

  for (const url of urls) {
    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);
    deduped.push(url);
  }

  return deduped;
}

async function downloadAndPersistImage(url, slug) {
  let lastError = null;

  for (let attempt = 1; attempt <= DOWNLOAD_RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('image/')) {
        throw new Error('Conteudo nao e imagem.');
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const dimensions = getImageDimensions(buffer);

      if (!dimensions) {
        throw new Error('Formato de imagem nao suportado.');
      }

      if (dimensions.width * dimensions.height < MIN_PIXELS) {
        throw new Error('Imagem abaixo de 1MP.');
      }

      const extension = dimensions.format === 'png' ? 'png' : 'jpg';
      const fileName = `${slug}.${extension}`;
      const outputPath = path.join(PUBLIC_IMAGES_DIR, fileName);
      await fs.promises.writeFile(outputPath, buffer);

      return {
        relativeUrl: `/images/${fileName}`,
        sourceUrl: response.url || url,
      };
    } catch (error) {
      lastError = error;
      if (attempt < DOWNLOAD_RETRIES) {
        await delay(650 * attempt);
      }
    }
  }

  throw lastError || new Error('Falha no download da imagem.');
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: {
        ...DEFAULT_HEADERS,
        accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function getImageDimensions(buffer) {
  const png = getPngDimensions(buffer);
  if (png) {
    return png;
  }

  const jpeg = getJpegDimensions(buffer);
  if (jpeg) {
    return jpeg;
  }

  return null;
}

function getPngDimensions(buffer) {
  const pngSignature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== pngSignature) {
    return null;
  }

  return {
    format: 'png',
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function getJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (!marker || marker === 0xd9) {
      break;
    }

    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }

    const size = buffer.readUInt16BE(offset + 2);
    if (size < 2) {
      break;
    }

    const isSofMarker =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isSofMarker) {
      return {
        format: 'jpg',
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + size;
  }

  return null;
}

function detectIndent(text) {
  const match = String(text).match(/^[ \t]+(?=")/m);
  return match ? match[0] : '  ';
}

function detectNewline(text) {
  return String(text).includes('\r\n') ? '\r\n' : '\n';
}

function slugify(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

async function ensureDirectory(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function writeCsvLog(rows) {
  const csvContent = stringifyCsv(rows, {
    header: true,
    columns: ['id', 'descricao', 'status', 'url'],
  });

  await fs.promises.writeFile(LOG_FILE, csvContent, 'utf8');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
