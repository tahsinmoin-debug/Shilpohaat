const express = require('express');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 

// Load environment variables FIRST before importing any other modules
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.js');
const artistRoutes = require('./routes/artist.js');
const artworkRoutes = require('./routes/artworks.js');
const orderRoutes = require('./routes/orders.js');
const paymentRoutes = require('./routes/payments.js');
const blogRoutes = require('./routes/blog.js');
const uploadRoutes = require('./routes/upload.js');

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Socket.IO Initialization Block (configured with env-driven CORS)
const httpServer = http.createServer(app); 
const activeUsers = new Map();

// Build allowed origins from env (comma-separated), fallback to localhost
const allowedOriginsEnv = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || '';
const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map(s => s.trim()).filter(Boolean)
    : ["http://localhost:3000"]; // default for local dev

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
        console.log(`[MSG] Active Users Map Size: ${activeUsers.size}`);
        if (recipientSocketId) {
            console.log(`[MSG] SUCCESS: Found Recipient Socket ID: ${recipientSocketId}`);

  
            io.to(recipientSocketId).emit('receiveMessage', { senderId, message });
            
            // Confirmation to sender
            io.to(socket.id).emit('messageSent', { recipientId, message }); 
        } else {
            console.error(`[MSG] ERROR: Recipient ${recipientId} not found in activeUsers.`);
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
// End Socket.IO Block

// Middleware - Increase body size limit for base64 images
// Note: Stripe webhook needs raw body, so we handle it separately
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS middleware (env-driven allowlist)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isAllowed = origin && allowedOrigins.includes(origin);
    if (isAllowed) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
    } else {
        // Fallback for non-browser or unlisted origins (no credentials with *)
        res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Shilpohaat API' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Artist routes
app.use('/api/artist', artistRoutes);

// Artwork routes
app.use('/api/artworks', artworkRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Payment routes
app.use('/api/payments', paymentRoutes);

// Blog routes
app.use('/api/blog', blogRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});


// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ') || 'none'}`);
});