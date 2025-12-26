const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.js');
const artistRoutes = require('./routes/artist.js');
const artworkRoutes = require('./routes/artworks.js');
const orderRoutes = require('./routes/orders.js');
const paymentRoutes = require('./routes/payments.js');
const blogRoutes = require('./routes/blog.js');
const uploadRoutes = require('./routes/upload.js');
const blogRoutes = require('./routes/blog.js');

connectDB();

const app = express();

// Middleware - Increase body size limit for base64 images
// Note: Stripe webhook needs raw body, so we handle it separately
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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

// Blog routes
app.use('/api/blog', blogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});