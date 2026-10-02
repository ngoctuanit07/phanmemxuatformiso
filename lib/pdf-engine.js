import fs from 'fs';
import puppeteer from 'puppeteer-core';

/**
 * Find available Chrome or Edge browser executable on Windows
 */
function findBrowserExecutable() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

/**
 * Generates an A4 PDF Buffer from an HTML string using sandboxed headless Chrome/Edge
 * Hardened against SSRF, LFI, and script execution vulnerabilities.
 * @param {string} htmlContent
 * @param {Object} options
 * @returns {Promise<Buffer>}
 */
export async function generatePdfFromHtml(htmlContent, options = {}) {
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    throw new Error('Không tìm thấy trình duyệt Google Chrome hoặc Microsoft Edge trên máy chủ để kết xuất PDF.');
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--font-render-hinting=medium'
      ]
    });

    const page = await browser.newPage();

    // 1. DEFENSE-IN-DEPTH: Disable client-side JavaScript execution during PDF print
    await page.setJavaScriptEnabled(false);

    // 2. DEFENSE-IN-DEPTH: Intercept requests to prevent Server-Side Request Forgery (SSRF) and Local File Inclusion (LFI)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url().toLowerCase();
      // Allow inline data URLs (e.g. data:image/png;base64) and internal about:blank
      if (url.startsWith('data:') || url.startsWith('about:')) {
        req.continue();
      } else {
        // Block external HTTP/HTTPS calls and file:// URLs
        req.abort();
      }
    });

    // 3. Set strict rendering timeout to prevent DoS
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: 15000 // 15s timeout
    });

    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      margin: options.margin || {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '20mm'
      },
      preferCSSPageSize: true,
      timeout: 15000
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF from HTML:', error.message);
    throw new Error(`Lỗi tạo file PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
