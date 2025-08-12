"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/tools/debug/debugHook.ts
const cucumber_1 = require("@cucumber/cucumber");
const playwright_1 = require("playwright");
const debugMode = ['1', 'true'].includes((process.env.CUCUMBER_DEBUG || '').toLowerCase());
let browser;
let page;
(0, cucumber_1.BeforeAll)(async function () {
    if (!debugMode)
        return;
    // Lanzamos en modo headful para inspección
    browser = await playwright_1.chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();
    // Exponemos la página en el World para usarla en los steps:
    this.page = page;
});
(0, cucumber_1.BeforeStep)(async function () {
    if (!debugMode)
        return;
    // Pausamos antes de cada paso para abrir el inspector UI de Playwright
    await page.pause();
});
(0, cucumber_1.AfterAll)(async function () {
    if (!debugMode)
        return;
    await browser.close();
});
