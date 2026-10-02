const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const helmet = require('helmet');

dotenv.config();

// Validate required environment variables at startup
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET is not set in environment variables. Server cannot start.');
}
if (!process.env.MONGODB_URI) {
  throw new Error('FATAL: MONGODB_URI is not set in environment variables. Server cannot start.');
}

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Store socket.io instance to be accessible in routes/controllers
app.set('socketio', io);

// Socket.io connection logic
io.on('connection', (socket) => {
  socket.on('join_deal_chat', (dealId) => {
    socket.join(dealId);
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected');
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const brandRoutes = require('./routes/brandRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const dealRoutes = require('./routes/dealRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes'); // We'll create this next

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', message: 'Server is awake and healthy' });
});
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kycRoutes = require('./routes/kycRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wishlists', require('./routes/wishlist'));
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/instagram', require('./routes/instagramRoutes'));

app.get('/', (req, res) => {
  res.send('Influencer Hub API is running...');
});

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum allowed is 100MB (subject to ImageKit plan limits).' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});
