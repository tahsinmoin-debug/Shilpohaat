console.log('Starting verification script...');
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'verify_output.txt');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n', 'utf8');
}

try {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    require('dotenv').config({ path: path.join(__dirname, '../.env') });
    log('Dotenv loaded.');
    const mongoose = require('mongoose');
    log('Mongoose loaded.');

    let getRecommendations;
    try {
        const controller = require('../controllers/recommendationController');
        getRecommendations = controller.getRecommendations;
        log('Controller loaded.');
    } catch (e) {
        log('Failed to load controller: ' + e.stack);
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
            log('\n--- API Response ---');
            if (data.success) {
                log('Success: true');
                log('AI Explanation: ' + data.aiExplanation);
                log('Recommendations Count: ' + data.recommendations.length);
                if (data.recommendations.length > 0) {
                    const top = data.recommendations[0];
                    log(`Title: ${top.title}`);
                    log(`Artist: ${top.artist?.name}`);
                    log(`AI Reason: ${top.aiReason}`);
                }
            } else {
                log('Failed: ' + JSON.stringify(data));
            }
        }
    };

    // Capture console.error too
    const origError = console.error;
    console.error = function (...args) {
        origError.apply(console, args);
        fs.appendFileSync(logFile, 'ERROR: ' + args.join(' ') + '\n', 'utf8');
    };

    // Capture console.log from controller? 
    // Controller uses console.log and console.error.
    // I should override them to capture output from controller.
    const origLog = console.log;
    console.log = function (...args) {
        origLog.apply(console, args);
        fs.appendFileSync(logFile, 'LOG: ' + args.join(' ') + '\n', 'utf8'); // Prefix LOG to distinguish
    };

    async function run() {
        try {
            //log('Connecting to DB...');
            // Using hacked console.log now
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
