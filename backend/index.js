const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables FIRST before importing any other modules
dotenv.config({ path: '.env.development' });

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.js');
const artistRoutes = require('./routes/artist.js');
const artworkRoutes = require('./routes/artworks.js');
const orderRoutes = require('./routes/orders.js');
const paymentRoutes = require('./routes/payments.js');
const blogRoutes = require('./routes/blog.js');
const uploadRoutes = require('./routes/upload.js');
const messageRoutes = require('./routes/messages.js'); // NEW

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST'],
  },
});

// Middleware - Increase body size limit for base64 images
// Note: Stripe webhook needs raw body, so we handle it separately
app.post(
  '/api/payments/stripe/webhook',
  express.raw({ type: 'application/json' })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS middleware (basic setup)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
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

// Message routes (NEW)
app.use('/api/messages', messageRoutes);

// Socket.io connection handling
const userSockets = new Map(); // Map userId to socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their userId
  socket.on('join', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Send message event
  socket.on('sendMessage', (data) => {
    const { recipientId, message } = data;
    const recipientSocketId = userSockets.get(recipientId);

    if (recipientSocketId) {
      // Send to recipient if online
      io.to(recipientSocketId).emit('receiveMessage', message);
      console.log(`Message sent to ${recipientId}`);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { recipientId, isTyping } = data;
    const recipientSocketId = userSockets.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('userTyping', {
        userId: data.senderId,
        isTyping,
      });
    }
  });

  // Disconnect event
  socket.on('disconnect', () => {
    // Remove user from map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io is ready for real-time messaging`);
});