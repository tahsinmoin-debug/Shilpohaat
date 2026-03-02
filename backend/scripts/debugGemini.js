const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function test() {
    const key = process.env.GEMINI_API_KEY;
    console.log('Key:', key ? key.substring(0, 5) + '...' : 'MISSING');

    const genAI = new GoogleGenerativeAI(key);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log('Generating content with gemini-pro...');
        const res = await model.generateContent('Hi');
        console.log('SUCCESS:', res.response.text());
    } catch (e) {
        console.error('FULL ERROR:', e);
    }
}

test();
