const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const candidates = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-pro",
    "gemini-1.0-pro",
    "defaults/gemini-1.5-flash"
];

const fs = require('fs');
const logFile = path.join(__dirname, 'model_check_output.txt');
fs.writeFileSync(logFile, '');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function check() {
    log("Checking API Key: " + (process.env.GEMINI_API_KEY ? "Present" : "Missing"));
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    for (const name of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent("Hello");
            log(`Testing ${name}... SUCCESS ✅`);
        } catch (e) {
            let msg = e.message;
            if (msg.includes('404')) msg = '404 Not Found';
            log(`Testing ${name}... FAILED ❌ (${msg})`);
        }
    }
}

check();
