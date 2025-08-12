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
const pomGenerator = __importStar(require("./locatorGenerator"));
const test_1 = require("@playwright/test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function run() {
    const inputUrl = process.argv[2] || process.env.BASEURL;
    if (!inputUrl) {
        console.error("Proporcione una URL como parámetro o defina BASEURL en .env.");
        process.exit(1);
    }
    const outputDir = path_1.default.join(__dirname, "output");
    if (!fs_1.default.existsSync(outputDir))
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    const outputFile = path_1.default.join(outputDir, "locators-output.ts");
    const browser = await test_1.chromium.launch();
    const page = await browser.newPage();
    await page.goto(inputUrl);
    // Se consideran los elementos interactivos: enlaces con href, botones, inputs, selects, textareas, 
    // y elementos con role="link" (además de los a que tengan href)
    const elements = await page.evaluate(() => {
        const selectorList = "a[href], button, input, select, textarea, [role='link']";
        const nodeList = document.querySelectorAll(selectorList);
        function getUniqueSelector(el) {
            let baseSelector = "";
            if (el.id) {
                baseSelector = `#${CSS.escape(el.id)}`;
            }
            else if (el.hasAttribute("data-testid")) {
                baseSelector = `[data-testid="${CSS.escape(el.getAttribute("data-testid") || "")}"]`;
            }
            else if (el.hasAttribute("aria-label")) {
                baseSelector = `[aria-label="${CSS.escape(el.getAttribute("aria-label") || "")}"]`;
            }
            else if (el.hasAttribute("role")) {
                baseSelector = `[role="${CSS.escape(el.getAttribute("role") || "")}"]`;
            }
            else if (el.className && el.className.trim() !== "") {
                const candidate = "." + el.className.trim().split(/\s+/).map(cls => CSS.escape(cls)).join(".");
                // Usamos el selector basado en clases solo si es único.
                if (document.querySelectorAll(candidate).length === 1) {
                    baseSelector = candidate;
                }
                else {
                    baseSelector = el.tagName.toLowerCase();
                }
            }
            else {
                baseSelector = el.tagName.toLowerCase();
            }
            // Si el selector obtenido coincide con más de un elemento, se añade :nth-of-type()
            const matchingNodes = document.querySelectorAll(baseSelector);
            if (matchingNodes.length > 1 && el.parentElement) {
                const siblings = el.parentElement.querySelectorAll(el.tagName.toLowerCase());
                const index = Array.from(siblings).indexOf(el) + 1;
                return baseSelector + `:nth-of-type(${index})`;
            }
            return baseSelector;
        }
        return Array.from(nodeList).map(el => {
            const text = el.textContent ? el.textContent.trim() : "";
            return {
                tag: el.tagName.toLowerCase(),
                text: text,
                selector: getUniqueSelector(el)
            };
        });
    });
    await browser.close();
    const pageName = new URL(inputUrl).hostname;
    pomGenerator.generatePOM(elements, outputFile, pageName);
    console.log("POM generado correctamente.");
}
run();
