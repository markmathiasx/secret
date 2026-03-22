#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const { spawnSync } = require('node:child_process');

const ROOT_DIR = process.cwd();
const SRC_DATA_DIR = path.join(ROOT_DIR, 'src', 'data');
const IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images');
const LOG_PATH = path.join(ROOT_DIR, 'fillImages.log.csv');
const REQUIRED_PACKAGES = ['puppeteer', 'cheerio', 'cli-progress', 'csv-stringify'];
const REQUEST_TIMEOUT_MS = 30000;
const RETRY_LIMIT = 3;
const MIN_PIXELS = 1000000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

let cheerio;
let stringifyCsv;
let cliProgress;
let puppeteer;

run().catch(() => {
  console.log('erros = 1');
  process.exitCode = 1;
});

async function run() {
  await ensureDependencies();
  cheerio = require('cheerio');
  ({ stringify: stringifyCsv } = require('csv-stringify/sync'));
  cliProgress = require('cli-progress');
  puppeteer = require('puppeteer');

  await fs.promises.mkdir(IMAGES_DIR, { recursive: true });

  const files = findCatalogFiles(SRC_DATA_DIR);
  const logRows = [];
  let errorCount = 0;

  if (files.length === 0) {
    await writeLog(logRows);
    console.log('imagens pendentes = 0');
    return;
  }

  const browser = await launchBrowser();
  const progress = new cliProgress.SingleBar({
    clearOnComplete: true,
    hideCursor: true,
    format: '',
    noTTYOutput: true,
    stream: { write() {} },
  });

  try {
    const pendingCount = files.reduce((total, file) => total + file.pending.length, 0);
    progress.start(pendingCount || 1, 0);

    for (const file of files) {
      let changed = false;

      for (const product of file.pending) {
        const id = normalizeText(product.id ?? product.sku ?? product.codigo ?? product.code ?? '');
        const descricao = getDescription(product);
        const slug = slugify(`${id}-${descricao}`) || `item-${Date.now()}`;
        const termo = [id, descricao].filter(Boolean).join(' ').trim();

        try {
          const sourceUrl =
            (await findGoogleImage(browser, termo)) ||
            (await findMakerWorldImage(browser, termo));

          if (!sourceUrl) {
            throw new Error('source-not-found');
          }

          const relativeUrl = await downloadAndPersistAsJpg(browser, sourceUrl, slug);
          product.image = relativeUrl;
          changed = true;
          logRows.push({ id, descricao, status: 'ok', url: relativeUrl });
        } catch {
          errorCount += 1;
          logRows.push({ id, descricao, status: 'erro', url: '' });
        } finally {
          progress.increment();
        }
      }

      if (changed) {
        const output = file.bom + JSON.stringify(file.json, null, file.indent) + file.newline;
        await fs.promises.writeFile(file.path, output, 'utf8');
      }
    }
  } finally {
    progress.stop();
    await browser.close().catch(() => {});
  }

  await writeLog(logRows);

  if (errorCount === 0) {
    console.log('imagens pendentes = 0');
  } else {
    console.log(`erros = ${errorCount}`);
    process.exitCode = 1;
  }
}

async function ensureDependencies() {
  const missing = REQUIRED_PACKAGES.filter((name) => !hasModule(name));
  if (missing.length === 0) return;

  const commands =
    process.platform === 'win32'
      ? [
          { command: 'npm.cmd', args: ['install', '--no-save', '--silent', '--no-progress', ...missing] },
          { command: 'cmd.exe', args: ['/c', 'npm', 'install', '--no-save', '--silent', '--no-progress', ...missing] },
        ]
      : [{ command: 'npm', args: ['install', '--no-save', '--silent', '--no-progress', ...missing] }];

  const env = { ...process.env };
  if (findBrowserExecutable()) {
    env.PUPPETEER_SKIP_DOWNLOAD = env.PUPPETEER_SKIP_DOWNLOAD || '1';
  }

  let installed = false;
  for (const entry of commands) {
    const result = spawnSync(entry.command, entry.args, {
      cwd: ROOT_DIR,
      env,
      stdio: 'ignore',
    });
    if (result.status === 0) {
      installed = true;
      break;
    }
  }

  if (!installed) {
    throw new Error('dependency-install-failed');
  }
}

function hasModule(name) {
  try {
    require.resolve(name, { paths: [ROOT_DIR] });
    return true;
  } catch {
    return false;
  }
}

function findCatalogFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const result = [];
  const stack = [rootDir];

  while (stack.length) {
    const current = stack.pop();
    let entries = [];

    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (!entry.isFile() || !/^catalogo-.*\.json$/i.test(entry.name)) {
        continue;
      }

      const parsed = readStyledJson(fullPath);
      const pending = collectPendingProducts(parsed.json);
      result.push({
        path: fullPath,
        bom: parsed.bom,
        indent: parsed.indent,
        newline: parsed.newline,
        json: parsed.json,
        pending,
      });
    }
  }

  return result.sort((a, b) => a.path.localeCompare(b.path));
}

function readStyledJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  const text = raw.replace(/^\uFEFF/, '');
  return {
    bom,
    indent: detectIndent(text),
    newline: detectNewline(text),
    json: JSON.parse(text),
  };
}

function detectIndent(text) {
  const match = String(text).match(/^[ \t]+(?=")/m);
  return match ? match[0] : '  ';
}

function detectNewline(text) {
  return String(text).includes('\r\n') ? '\r\n' : '\n';
}

function collectPendingProducts(root) {
  const list = [];
  walk(root, (node) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;
    const id = normalizeText(node.id ?? node.sku ?? node.codigo ?? node.code ?? '');
    const descricao = getDescription(node);
    if (!id || !descricao) return;
    if (!isImageMissing(node.image)) return;
    list.push(node);
  });
  return list;
}

function walk(node, visitor) {
  if (Array.isArray(node)) {
    for (const item of node) {
      walk(item, visitor);
    }
    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  visitor(node);

  for (const value of Object.values(node)) {
    walk(value, visitor);
  }
}

function getDescription(node) {
  return normalizeText(
    node.descricao ??
      node.description ??
      node.nome ??
      node.name ??
      node.titulo ??
      node.title ??
      ''
  );
}

function isImageMissing(value) {
  return typeof value !== 'string' || value.trim() === '';
}

async function launchBrowser() {
  const executablePath = findBrowserExecutable();
  const options = {
    headless: true,
    defaultViewport: { width: 1600, height: 1000 },
    ignoreHTTPSErrors: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-features=IsolateOrigins,site-per-process',
      '--lang=en-US',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  };

  if (executablePath) {
    options.executablePath = executablePath;
  } else if (process.platform === 'win32') {
    options.channel = 'chrome';
  }

  return puppeteer.launch(options);
}

function findBrowserExecutable() {
  const localAppData = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.PROGRAMFILES || '';
  const programFilesX86 = process.env['PROGRAMFILES(X86)'] || '';
  const home = process.env.HOME || process.env.USERPROFILE || '';

  const candidates =
    process.platform === 'win32'
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
            path.join(home, '.cache', 'puppeteer', 'chrome', 'chrome'),
          ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return '';
}

async function createPage(browser) {
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
  });
  page.setDefaultNavigationTimeout(REQUEST_TIMEOUT_MS);
  page.setDefaultTimeout(REQUEST_TIMEOUT_MS);
  await page.setBypassCSP(true);
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get() {
        return undefined;
      },
    });
    Object.defineProperty(navigator, 'languages', {
      get() {
        return ['en-US', 'en', 'pt-BR', 'pt'];
      },
    });
    Object.defineProperty(navigator, 'plugins', {
      get() {
        return [1, 2, 3, 4, 5];
      },
    });
  });
  return page;
}

async function findGoogleImage(browser, termo) {
  const query = `${termo} filetype:jpg OR filetype:png`;
  const page = await createPage(browser);

  try {
    const url = `https://www.google.com/search?tbm=isch&hl=en&gl=us&tbs=isz:l&q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: REQUEST_TIMEOUT_MS });
    await maybeAcceptGoogleConsent(page);
    await waitForGoogleResults(page);

    for (let index = 0; index < 12; index += 1) {
      const clicked = await clickGoogleResult(page, index);
      if (!clicked) break;
      await delay(900);
      const candidate = await extractGoogleHighResImage(page);
      if (candidate) {
        return candidate;
      }
    }

    const html = await page.content();
    const fallbackCandidates = extractGoogleFallbackCandidates(html);
    return fallbackCandidates[0] || '';
  } catch {
    return '';
  } finally {
    await page.close().catch(() => {});
  }
}

async function maybeAcceptGoogleConsent(page) {
  try {
    await page.waitForSelector('body', { timeout: 5000 });
    await page.evaluate(() => {
      const phrases = ['accept all', 'i agree', 'accept', 'aceitar', 'concordo'];
      const elements = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
      const target = elements.find((element) => {
        const text = ((element.textContent || '') + ' ' + (element.getAttribute('value') || '')).toLowerCase();
        return phrases.some((phrase) => text.includes(phrase));
      });
      if (target instanceof HTMLElement) {
        target.click();
      }
    });
    await delay(800);
  } catch {}
}

async function waitForGoogleResults(page) {
  const selectors = [
    'a[href*="/imgres?"]',
    'img.YQ4gaf',
    'img.rg_i',
    'img[src*="gstatic.com/images"]',
    'img[src*="encrypted-tbn"]',
  ];

  const deadline = Date.now() + REQUEST_TIMEOUT_MS;
  while (Date.now() < deadline) {
    for (const selector of selectors) {
      const found = await page.$(selector);
      if (found) return;
    }
    await delay(250);
  }

  throw new Error('google-results-timeout');
}

async function clickGoogleResult(page, index) {
  const selectors = [
    'a[href*="/imgres?"] img',
    'img.YQ4gaf',
    'img.rg_i',
    'img[src*="encrypted-tbn"]',
  ];

  for (const selector of selectors) {
    const handles = await page.$$(selector);
    if (!handles.length) continue;
    const handle = handles[index];
    if (!handle) continue;
    try {
      await handle.evaluate((node) => {
        node.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
      });
      await delay(200);
      await handle.click({ delay: 40 });
      return true;
    } catch {
      continue;
    }
  }

  return false;
}

async function extractGoogleHighResImage(page) {
  return page.evaluate((minimumPixels) => {
    const ignoredHosts = ['gstatic.com', 'google.com', 'googleusercontent.com'];
    const candidates = Array.from(document.images)
      .map((image) => {
        const src = image.currentSrc || image.src || '';
        const width = image.naturalWidth || Number(image.getAttribute('width')) || 0;
        const height = image.naturalHeight || Number(image.getAttribute('height')) || 0;
        return {
          src,
          pixels: width * height,
          visible: image.getBoundingClientRect().width > 0 && image.getBoundingClientRect().height > 0,
        };
      })
      .filter((item) => {
        if (!item.src || !item.src.startsWith('http')) return false;
        if (item.pixels < minimumPixels) return false;
        try {
          const host = new URL(item.src).hostname.toLowerCase();
          if (ignoredHosts.some((value) => host.includes(value))) return false;
        } catch {
          return false;
        }
        return true;
      })
      .sort((a, b) => Number(b.visible) - Number(a.visible) || b.pixels - a.pixels);

    return candidates[0]?.src || '';
  }, MIN_PIXELS);
}

function extractGoogleFallbackCandidates(html) {
  const $ = cheerio.load(html);
  const urls = [];

  $('a[href*="/imgres?"], a[href*="imgurl="], img').each((_, element) => {
    const href = $(element).attr('href') || '';
    const src = $(element).attr('src') || $(element).attr('data-src') || '';
    const direct =
      extractUrlFromGoogleHref(href) ||
      normalizeHttpUrl(src);
    if (direct) {
      urls.push(direct);
    }
  });

  return unique(urls);
}

function extractUrlFromGoogleHref(href) {
  if (!href) return '';
  try {
    const absolute = new URL(href, 'https://www.google.com');
    const direct = absolute.searchParams.get('imgurl') || absolute.searchParams.get('imgrefurl');
    return direct ? normalizeHttpUrl(decodeURIComponent(direct)) : '';
  } catch {
    return '';
  }
}

async function findMakerWorldImage(browser, termo) {
  const page = await createPage(browser);
  const searchUrls = [
    `https://makerworld.com/en/search/models?keyword=${encodeURIComponent(termo)}`,
    `https://makerworld.com/en/search/models?isFromSearchList=true&keyword=${encodeURIComponent(termo)}`,
    `https://makerworld.com/search/models?keyword=${encodeURIComponent(termo)}`,
    `https://makersworld.io/search?keyword=${encodeURIComponent(termo)}`,
  ];

  try {
    for (const searchUrl of searchUrls) {
      try {
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: REQUEST_TIMEOUT_MS });
        await delay(1800);
        const modelUrl = await extractMakerWorldModelUrl(page);
        if (!modelUrl) {
          continue;
        }

        await page.goto(modelUrl, { waitUntil: 'domcontentloaded', timeout: REQUEST_TIMEOUT_MS });
        await delay(1800);

        const ogImage = await extractMetaContent(page, 'meta[property="og:image"], meta[name="og:image"]');
        if (ogImage) {
          return ogImage;
        }

        const imageUrl = await page.evaluate(() => {
          const candidates = Array.from(document.images)
            .map((image) => ({
              src: image.currentSrc || image.src || '',
              width: image.naturalWidth || 0,
              height: image.naturalHeight || 0,
              top: image.getBoundingClientRect().top,
            }))
            .filter((item) => item.src.startsWith('http') && item.width > 0 && item.height > 0)
            .sort((a, b) => b.width * b.height - a.width * a.height || a.top - b.top);
          return candidates[0]?.src || '';
        });

        if (imageUrl) {
          return imageUrl;
        }
      } catch {}
    }
    return '';
  } finally {
    await page.close().catch(() => {});
  }
}

async function extractMakerWorldModelUrl(page) {
  const href = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    const candidate = anchors.find((anchor) => {
      const hrefValue = anchor.getAttribute('href') || '';
      return /\/(en\/)?models\//i.test(hrefValue);
    });
    return candidate ? candidate.getAttribute('href') || '' : '';
  });

  if (!href) return '';

  try {
    return new URL(href, page.url()).toString();
  } catch {
    return '';
  }
}

async function extractMetaContent(page, selector) {
  try {
    const content = await page.$eval(selector, (element) => element.getAttribute('content') || '');
    return normalizeHttpUrl(content);
  } catch {
    return '';
  }
}

async function downloadAndPersistAsJpg(browser, imageUrl, slug) {
  const targetPath = path.join(IMAGES_DIR, `${slug}.jpg`);
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt += 1) {
    try {
      const downloaded = await fetchImageBuffer(imageUrl);
      if (!downloaded.dimensions || downloaded.dimensions.width * downloaded.dimensions.height < MIN_PIXELS) {
        throw new Error('image-too-small');
      }

      if (downloaded.format === 'jpg') {
        await fs.promises.writeFile(targetPath, downloaded.buffer);
      } else {
        await convertBufferToJpg(browser, downloaded.buffer, downloaded.format, downloaded.dimensions, targetPath);
      }

      return `/images/${path.basename(targetPath)}`;
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_LIMIT) {
        await delay(500 * attempt);
      }
    }
  }

  throw lastError || new Error('download-failed');
}

async function fetchImageBuffer(url) {
  const response = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS, {
    'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
    referer: 'https://www.google.com/',
    'user-agent': USER_AGENT,
  });

  if (!response.ok) {
    throw new Error(`http-${response.status}`);
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const dimensions = getImageDimensions(buffer);

  if (!dimensions) {
    throw new Error('unsupported-image');
  }

  const format =
    contentType.includes('jpeg') || dimensions.format === 'jpg'
      ? 'jpg'
      : contentType.includes('png') || dimensions.format === 'png'
        ? 'png'
        : '';

  if (!format) {
    throw new Error('invalid-format');
  }

  return { buffer, format, dimensions };
}

async function fetchWithTimeout(url, timeoutMs, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers,
      redirect: 'follow',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function convertBufferToJpg(browser, buffer, format, dimensions, targetPath) {
  const page = await createPage(browser);

  try {
    const maxDimension = 2400;
    const scale = Math.min(1, maxDimension / Math.max(dimensions.width, dimensions.height));
    const width = Math.max(1, Math.round(dimensions.width * scale));
    const height = Math.max(1, Math.round(dimensions.height * scale));
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;

    await page.setViewport({ width: Math.max(width + 40, 320), height: Math.max(height + 40, 320) });
    await page.setContent(
      `<style>html,body{margin:0;padding:0;background:#fff}body{display:grid;place-items:center;min-height:100vh}img{display:block;width:${width}px;height:${height}px;object-fit:contain;background:#fff}</style><img id="target" src="${dataUrl}">`,
      { waitUntil: 'load' }
    );

    await page.waitForFunction(() => {
      const image = document.getElementById('target');
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
    });

    const imageHandle = await page.$('#target');
    if (!imageHandle) {
      throw new Error('jpeg-conversion-target-missing');
    }

    await imageHandle.screenshot({
      path: targetPath,
      type: 'jpeg',
      quality: 92,
      omitBackground: false,
    });
  } finally {
    await page.close().catch(() => {});
  }
}

function getImageDimensions(buffer) {
  return getJpegDimensions(buffer) || getPngDimensions(buffer);
}

function getPngDimensions(buffer) {
  if (buffer.length < 24) return null;
  if (buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;
  return {
    format: 'png',
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function getJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (!marker || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }

    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) break;

    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isSof) {
      return {
        format: 'jpg',
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += 2 + length;
  }

  return null;
}

async function writeLog(rows) {
  const csv = stringifyCsv(rows, {
    header: true,
    columns: ['id', 'descricao', 'status', 'url'],
  });
  await fs.promises.writeFile(LOG_PATH, csv, 'utf8');
}

function normalizeHttpUrl(value) {
  const text = normalizeText(value);
  if (!text) return '';
  try {
    const url = new URL(text);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

function normalizeText(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  return '';
}

function slugify(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

function unique(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
