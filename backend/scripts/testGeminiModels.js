const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-pro",
    "gemini-1.0-pro"
];

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    for (const modelName of models) {
        console.log(`\nTesting ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const res = await model.generateContent('Hi');
            console.log(`SUCCESS: ${modelName} works!`);
            return; // Stop after first success
        } catch (e) {
            console.log(`FAILED: ${modelName} - ${e.message.split('\n')[0]}`);
        }
    }
}

test();
