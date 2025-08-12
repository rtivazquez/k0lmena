"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const axios_1 = __importDefault(require("axios"));
const test_1 = require("@playwright/test");
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar las variables de entorno de API
dotenv_1.default.config({ path: '.env.api' });
let response;
(0, cucumber_1.Given)("I make a GET request to {string}", async function (endpoint) {
    const baseURL = process.env.API_BASEURL || "https://petstore.swagger.io";
    response = await axios_1.default.get(`${baseURL}${endpoint}`);
});
(0, cucumber_1.Then)("the response status should be {int}", function (status) {
    (0, test_1.expect)(response.status).toBe(status);
});
(0, cucumber_1.Then)("the response should contain {string}", function (key) {
    (0, test_1.expect)(response.data).toHaveProperty(key);
});
