// src/front-test/hooks/hook.ts
"use strict";

import { chromium, Browser, Page } from 'playwright';
import { BeforeAll, AfterAll, AfterStep, Status, setDefaultTimeout } from '@cucumber/cucumber';
import * as fs from 'fs';
import * as path from 'path';

setDefaultTimeout(60 * 1000);

const logs: string[] = [];
const originalConsoleLog = console.log;
console.log = function (...args: any[]) {
  logs.push(args.join(' '));
  originalConsoleLog.apply(console, args);
};

let browser: Browser;
const pages: Page[] = [];

BeforeAll(async () => {
  console.log('[HOOK] Lanzando navegador Chromium...');
  browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  pages.push(page);
  console.log('[HOOK] Página inicializada correctamente.');
});

AfterStep(async function ({ result }) {
  if (result?.status === Status.FAILED) {
    const page = pages[0];
    const screenshot = await page.screenshot();

    const screenshotsDir = path.join(process.cwd(), 'src', 'reports', 'front', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const screenshotFileName = `screenshot-${Date.now()}.png`;
    const filePath = path.join(screenshotsDir, screenshotFileName);
    fs.writeFileSync(filePath, screenshot);

    await this.attach(screenshot, 'image/png');

    let errorDetails = '';
    if (result.exception instanceof Error) {
      errorDetails += "Error Exception: " + result.exception.toString() + "\n";
      if (result.exception.stack) {
        errorDetails += "Stack Trace: " + result.exception.stack + "\n";
      }
    }

    if (logs.length > 0) {
      errorDetails += "Logs de consola:\n" + logs.join('\n');
      logs.length = 0;
    }

    if (errorDetails) {
      await this.attach(errorDetails, 'text/plain');
    }
  }
});

AfterAll(async () => {
  console.log('[HOOK] Cerrando navegador...');
  if (browser) {
    await browser.close();
  }
});

export { pages };
