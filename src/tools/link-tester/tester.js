"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlAndTest = crawlAndTest;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const url_1 = require("url");
const p_limit_1 = __importDefault(require("p-limit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Configuración de directorio de salida
const OUTPUT_DIR = path_1.default.resolve(__dirname);
const OUTPUT_FILE = path_1.default.join(OUTPUT_DIR, 'output.txt');
const ERROR_LOG_FILE = path_1.default.join(OUTPUT_DIR, 'error_log.txt');
// Asegurar existencia del directorio de salida
fs_1.default.mkdirSync(OUTPUT_DIR, { recursive: true });
let outputLines = [];
function logLine(line) {
    console.log(line);
    outputLines.push(line);
}
// Concurrencia
const PAGE_CONCURRENCY = 5;
const RESOURCE_CONCURRENCY = 20;
const limitResource = (0, p_limit_1.default)(RESOURCE_CONCURRENCY);
// Helper para formatear duración en hh:mm:ss
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
}
// Obtiene HTML de una URL
async function fetchHTML(pageUrl) {
    try {
        const resp = await axios_1.default.get(pageUrl, {
            responseType: 'text',
            headers: { 'User-Agent': 'k0lmena-link-tester/1.0' }
        });
        return resp.data;
    }
    catch (error) {
        // Registrar error de fetch con contexto
        const msg = `Error al obtener HTML de ${pageUrl}\n` +
            `Status: ${error.response?.status || 'sin respuesta'}\n` +
            `Mensaje: ${error.message}`;
        throw new Error(msg);
    }
}
// Extrae enlaces e imágenes válidas para testear
function extractResources(html, baseUrl) {
    const $ = cheerio.load(html);
    const items = [];
    // Links
    $('a[href]').each((_, el) => {
        const href = $(el).attr('href').trim();
        if (/^(data:|#|mailto:|tel:)/.test(href))
            return;
        if (href.includes('[') || href.includes(']'))
            return; // ignorar URLs con corchetes
        try {
            const u = new url_1.URL(href, baseUrl);
            if (u.hash)
                return;
            if (u.href.includes('PHPSESSID') || u.href.includes('/cdn-cgi/l/email-protection'))
                return;
            items.push({ url: u.href, type: 'link' });
        }
        catch { }
    });
    // Extensiones de imagen comunes
    const isImageExt = (p) => /\.(jpe?g|png|gif|svg)$/i.test(p);
    // Imágenes en src y srcset
    $('img').each((_, el) => {
        const src = $(el).attr('src')?.trim();
        if (src && !src.startsWith('data:') && !src.includes('[') && !src.includes(']')) {
            try {
                const u = new url_1.URL(src, baseUrl);
                if (!u.hash && !u.href.includes('PHPSESSID') && isImageExt(u.pathname)) {
                    items.push({ url: u.href, type: 'image' });
                }
            }
            catch { }
        }
        const srcset = $(el).attr('srcset');
        if (srcset) {
            srcset.split(',').forEach(part => {
                const urlPart = part.trim().split(/\s+/)[0];
                if (urlPart && !urlPart.startsWith('data:') && !urlPart.includes('[') && !urlPart.includes(']')) {
                    try {
                        const u = new url_1.URL(urlPart, baseUrl);
                        if (!u.hash && !u.href.includes('PHPSESSID') && isImageExt(u.pathname)) {
                            items.push({ url: u.href, type: 'image' });
                        }
                    }
                    catch { }
                }
            });
        }
    });
    // Imágenes en <source srcset>
    $('source[srcset]').each((_, el) => {
        $(el).attr('srcset').split(',').forEach(part => {
            const urlPart = part.trim().split(/\s+/)[0];
            if (urlPart && !urlPart.startsWith('data:') && !urlPart.includes('[') && !urlPart.includes(']')) {
                try {
                    const u = new url_1.URL(urlPart, baseUrl);
                    if (!u.hash && !u.href.includes('PHPSESSID') && isImageExt(u.pathname)) {
                        items.push({ url: u.href, type: 'image' });
                    }
                }
                catch { }
            }
        });
    });
    return items;
}
// Obtiene código de estado
async function getStatusCode(url) {
    try {
        const head = await axios_1.default.head(url, { timeout: 5000, maxRedirects: 5, headers: { 'User-Agent': 'k0lmena-link-tester/1.0' } });
        return head.status;
    }
    catch (e) {
        const st = e.response?.status;
        if (st && st !== 405)
            return st;
    }
    try {
        const get = await axios_1.default.get(url, { timeout: 5000, maxRedirects: 5, responseType: 'stream', headers: { 'User-Agent': 'k0lmena-link-tester/1.0' } });
        return get.status;
    }
    catch (e) {
        return e.response?.status ?? null;
    }
}
// Verifica que recurso image tenga content-type imagen
async function isImageValid(url) {
    const cleanUrl = url.split('?')[0];
    try {
        const head = await axios_1.default.head(cleanUrl, { timeout: 5000, headers: { 'User-Agent': 'k0lmena-link-tester/1.0' } });
        return (head.headers['content-type'] || '').startsWith('image/');
    }
    catch {
        return false;
    }
}
// Testea lista de recursos
async function testResources(resources) {
    const brokenLinks = [];
    const brokenImages = [];
    await Promise.all(resources.map(r => limitResource(async () => {
        const testUrl = r.type === 'image' ? r.url.split('?')[0] : r.url;
        const status = await getStatusCode(testUrl);
        const code = status ?? 0;
        let broken = false;
        if ([400, 404].includes(code) || (code >= 500 && code < 600))
            broken = true;
        else if (r.type === 'image' && !(await isImageValid(r.url)))
            broken = true;
        if (broken) {
            if (r.type === 'link')
                brokenLinks.push(r);
            else
                brokenImages.push(r);
        }
    })));
    return { brokenLinks, brokenImages };
}
// Obtiene URLs del sitemap
async function getSitemapUrls(baseUrl) {
    try {
        const xml = await fetchHTML(baseUrl.replace(/\/$/, '') + '/sitemap.xml');
        const urls = [];
        const re = /<loc>(.*?)<\/loc>/g;
        let m;
        while ((m = re.exec(xml)))
            urls.push(m[1].trim());
        return urls;
    }
    catch {
        return [];
    }
}
// Escaneo completo (crawler)
async function crawlAndTest(baseUrl) {
    logLine('🚀 Iniciando escaneo completo...');
    const baseHost = new url_1.URL(baseUrl).hostname;
    const visited = new Set();
    const brokenLinksAll = [];
    const brokenImagesAll = [];
    let totalLinks = 0;
    let totalImages = 0;
    let currentPage = '';
    const sitemap = await getSitemapUrls(baseUrl);
    const queue = [baseUrl, ...sitemap.filter(u => new url_1.URL(u).hostname.endsWith(baseHost))];
    const limitPage = (0, p_limit_1.default)(PAGE_CONCURRENCY);
    const startTime = Date.now();
    try {
        while (queue.length) {
            const batch = queue.splice(0, PAGE_CONCURRENCY);
            await Promise.all(batch.map(page => limitPage(async () => {
                if (visited.has(page))
                    return;
                visited.add(page);
                currentPage = page;
                logLine(`🔍 Escaneando: ${page}`);
                const html = await fetchHTML(page);
                const resources = extractResources(html, page);
                totalLinks += resources.filter(r => r.type === 'link').length;
                totalImages += resources.filter(r => r.type === 'image').length;
                const { brokenLinks, brokenImages } = await testResources(resources);
                brokenLinksAll.push(...brokenLinks);
                brokenImagesAll.push(...brokenImages);
                brokenLinks.forEach(r => logLine(`- 🚫 Enlace roto: ${r.url}`));
                brokenImages.forEach(r => logLine(`- 🚫 Imagen rota: ${r.url}`));
                resources.filter(r => r.type === 'link').forEach(r => {
                    try {
                        const u = new url_1.URL(r.url);
                        if ((u.hostname === baseHost || u.hostname.endsWith(`.${baseHost}`)) && !visited.has(u.href) && !queue.includes(u.href)) {
                            queue.push(u.href);
                        }
                    }
                    catch { }
                });
            })));
        }
    }
    catch (error) {
        const timestamp = new Date().toISOString();
        const errContent = `=== Error en página: ${currentPage} ===\n` +
            `Time: ${timestamp}\n` +
            `Mensaje: ${error.message}\n` +
            `Stack:\n${error.stack}\n`;
        fs_1.default.writeFileSync(ERROR_LOG_FILE, errContent, 'utf-8');
        fs_1.default.writeFileSync(OUTPUT_FILE, outputLines.join('\n'), 'utf-8');
        throw error;
    }
    const endTime = Date.now();
    logLine('');
    logLine('✅ Escaneo completo finalizado.');
    logLine(`Páginas escaneadas: ${visited.size}`);
    logLine(`🔗 Total enlaces: ${totalLinks} | 🚫 Enlaces rotos: ${brokenLinksAll.length}`);
    logLine(`🖼️ Total imágenes: ${totalImages} | 🚫 Imágenes rotas: ${brokenImagesAll.length}`);
    logLine(`⏱️ Duración: ${formatDuration(endTime - startTime)}`);
    // Guardar resultados completos
    fs_1.default.writeFileSync(OUTPUT_FILE, outputLines.join('\n'), 'utf-8');
    logLine(`📄 Resultados guardados en: ${OUTPUT_FILE}`);
}
// Escaneo de página única
async function testSinglePage(baseUrl) {
    logLine('🚀 Iniciando escaneo de página única...');
    const startTime = Date.now();
    let currentPage = baseUrl;
    try {
        const html = await fetchHTML(baseUrl);
        const resources = extractResources(html, baseUrl);
        const { brokenLinks, brokenImages } = await testResources(resources);
        brokenLinks.forEach(r => logLine(`- 🚫 Enlace roto: ${r.url}`));
        brokenImages.forEach(r => logLine(`- 🚫 Imagen rota: ${r.url}`));
        const endTime = Date.now();
        logLine('');
        logLine('🔚 Resultados para página única:');
        logLine(`🔗 Enlaces escaneados: ${resources.filter(r => r.type === 'link').length} | 🚫 Enlaces rotos: ${brokenLinks.length}`);
        logLine(`🖼️ Imágenes escaneadas: ${resources.filter(r => r.type === 'image').length} | 🚫 Imágenes rotas: ${brokenImages.length}`);
        logLine(`⏱️ Duración: ${formatDuration(endTime - startTime)}`);
    }
    catch (error) {
        const timestamp = new Date().toISOString();
        const errContent = `=== Error en página única: ${currentPage} ===\n` +
            `Time: ${timestamp}\n` +
            `Mensaje: ${error.message}\n` +
            `Stack:\n${error.stack}\n`;
        fs_1.default.writeFileSync(ERROR_LOG_FILE, errContent, 'utf-8');
        fs_1.default.writeFileSync(OUTPUT_FILE, outputLines.join('\n'), 'utf-8');
        throw error;
    }
    // Guardar resultados
    fs_1.default.writeFileSync(OUTPUT_FILE, outputLines.join('\n'), 'utf-8');
    logLine(`📄 Resultados guardados en: ${OUTPUT_FILE}`);
}
// CLI con opciones
async function main() {
    const baseUrl = process.env.BASEURL;
    if (!baseUrl) {
        console.error('❌ Error: BASEURL no definido');
        process.exit(1);
    }
    const args = process.argv.slice(2);
    const full = args.includes('-full');
    // Limpiar líneas previas
    outputLines = [];
    try {
        if (full)
            await crawlAndTest(baseUrl);
        else
            await testSinglePage(baseUrl);
    }
    catch (error) {
        console.error('❌ Error durante el escaneo. Consulta error_log.txt para más detalles.');
    }
}
if (require.main === module)
    main();
