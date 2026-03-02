const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'verify_output.txt');

// Reset log file
if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

// Monkey patch console
const origLog = console.log;
const origError = console.error;

function formatArgs(args) {
    return args.map(a => {
        if (a instanceof Error) return a.stack;
        if (typeof a === 'object') return JSON.stringify(a);
        return String(a);
    }).join(' ');
}

console.log = function (...args) {
    const msg = formatArgs(args);
    fs.appendFileSync(logFile, 'LOG: ' + msg + '\n', 'utf8');
    origLog.apply(console, args);
};

console.error = function (...args) {
    const msg = formatArgs(args);
    fs.appendFileSync(logFile, 'ERROR: ' + msg + '\n', 'utf8');
    origError.apply(console, args);
};

console.log('Starting verification script (Gemini)...');

try {
    const envPath = path.join(__dirname, '../.env');
    require('dotenv').config({ path: envPath });
    console.log('Dotenv loaded from ' + envPath);

    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is missing in .env');
        process.exit(1);
    } else {
        console.log('GEMINI_API_KEY found: ' + process.env.GEMINI_API_KEY.substring(0, 4) + '...');
    }

    const mongoose = require('mongoose');
    console.log('Mongoose loaded.');

    let getRecommendations;
    try {
        const controller = require('../controllers/recommendationController');
        getRecommendations = controller.getRecommendations;
        console.log('Controller loaded.');
    } catch (e) {
        console.error('Failed to load controller', e);
        process.exit(1);
    }

    // Mock Request and Response
    const req = {
        body: {
            category: 'All',
            limit: 3
        }
    };

    const res = {
        status: function (code) {
            this.statusCode = code;
            return this;
        },
        json: function (data) {
            console.log('\n--- API Response ---');
            if (data.success) {
                console.log('Success: true');
                console.log('AI Explanation: ' + data.aiExplanation);
                console.log('Recommendations Count: ' + data.recommendations.length);
                if (data.recommendations.length > 0) {
                    const top = data.recommendations[0];
                    console.log(`Title: ${top.title}`);
                    console.log(`Artist: ${top.artist?.name}`);
                    console.log(`AI Reason: ${top.aiReason}`);
                }
            } else {
                console.error('Failed response:', data);
            }
        }
    };

    async function run() {
        try {
            console.log('Connecting to DB...');
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected.');

            console.log('Calling getRecommendations...');
            await getRecommendations(req, res);

        } catch (err) {
            console.error('Error running verification:', err);
        } finally {
            await mongoose.disconnect();
            console.log('Disconnected.');
        }
    }

    run();

} catch (e) {
    fs.appendFileSync(logFile, 'Top level error: ' + e.stack + '\n', 'utf8');
}
