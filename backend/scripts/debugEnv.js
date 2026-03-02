const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env:', result.error);
} else {
    console.log('Parsed env keys:', Object.keys(result.parsed));
}

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Found (starts with ' + process.env.OPENAI_API_KEY.substring(0, 3) + ')' : 'Not Found');

try {
    const OpenAI = require('openai');
    console.log('OpenAI module found');
} catch (e) {
    console.error('OpenAI module NOT found');
}
