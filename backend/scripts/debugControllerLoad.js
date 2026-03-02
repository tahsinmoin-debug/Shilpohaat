try {
    console.log('Attempting to require controller...');
    const controller = require('../controllers/recommendationController');
    console.log('Success!');
} catch (e) {
    console.error('FAIL:', e.message);
    console.error('CODE:', e.code);
    if (e.requireStack) console.error('STACK:', e.requireStack);
}
