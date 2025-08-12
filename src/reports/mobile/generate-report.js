"use strict";
// src/reports/mobile/generate-report.ts
Object.defineProperty(exports, "__esModule", { value: true });
const multiple_cucumber_html_reporter_1 = require("multiple-cucumber-html-reporter");
const path_1 = require("path");
(0, multiple_cucumber_html_reporter_1.generate)({
    // Directorio donde se encuentra el JSON generado por Cucumber
    jsonDir: (0, path_1.resolve)(__dirname),
    // Directorio donde se generará el HTML
    reportPath: (0, path_1.resolve)(__dirname, 'html'),
    metadata: {
        browser: {
            name: 'Appium',
            version: 'N/A'
        },
        device: 'Android device',
        platform: {
            name: 'Android',
            version: '11.0' // Actualizá según corresponda
        }
    },
    customData: {
        title: 'Información de la Ejecución',
        data: [
            { label: 'Proyecto', value: 'k0lmena Mobile Automation' },
            { label: 'Ejecutado', value: new Date().toLocaleString() }
        ]
    }
});
