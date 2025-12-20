const express = require('express');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.js');
const artistRoutes = require('./routes/artist.js');
const artworkRoutes = require('./routes/artworks.js');
const orderRoutes = require('./routes/orders.js');
const paymentRoutes = require('./routes/payments.js');
const blogRoutes = require('./routes/blog.js');
const uploadRoutes = require('./routes/upload.js');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/admin.js');
const commissionRoutes = require('./routes/commissions.js');

connectDB();

const app = express();
const httpServer = http.createServer(app); 
const activeUsers = new Map();

const allowedOriginsEnv = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || '';
const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map(s => s.trim()).filter(Boolean)
    : ["http://localhost:3000"];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('registerUser', (userId) => {
        console.log(`Server received registration for: ${userId}`); 
        activeUsers.set(userId, socket.id);
        io.emit('onlineUsers', Array.from(activeUsers.keys()));
    });

    socket.on('privateMessage', ({ recipientId, senderId, message }) => {
        const recipientSocketId = activeUsers.get(recipientId);
        console.log(`[MSG] From: ${senderId} to: ${recipientId}.`);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receiveMessage', { senderId, message });
            io.to(socket.id).emit('messageSent', { recipientId, message }); 
        } else {
            io.to(socket.id).emit('messageFailed', { message: 'Recipient is currently offline.' });
        }
    });

    socket.on('disconnect', () => {
        activeUsers.forEach((socketId, userId) => {
            if (socketId === socket.id) {
                activeUsers.delete(userId);
            }
        });
        io.emit('onlineUsers', Array.from(activeUsers.keys()));
    });
});
console.log('Socket.IO server initialized.'); 

app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isAllowed = origin && allowedOrigins.includes(origin);
    if (isAllowed) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-firebase-uid');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Shilpohaat API' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/artist', artistRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/promotions', require('./routes/promotionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/verify', require('./routes/verificationRoutes'));
app.use('/api/badges', require('./routes/badgeRoutes'));
app.use('/api/artworks', reviewRoutes);
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/commissions', commissionRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ') || 'none'}`);
});
