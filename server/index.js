require('dotenv').config();
const admin = require('./firebaseAdmin');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const MatchingEngine = require('./matchingEngine');

const app = express();
const server = http.createServer(app);

// Basic Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST']
}));

// Rate limiting for API routes (if any)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Parse JSON bodies
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

const matchingEngine = new MatchingEngine(io);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_queue', (data) => {
    const interests = data?.interests || [];
    matchingEngine.joinQueue(socket, interests, data?.uid);
  });

  socket.on('skip', () => {
     matchingEngine.leaveChat(socket);
  });

  socket.on('send_message', (data) => {
      const roomId = socket.roomId;
      if (roomId) {
          socket.to(roomId).emit('receive_message', {
              senderId: socket.id,
              text: data.text,
              type: data.type || 'text',
              timestamp: Date.now()
          });
      }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    matchingEngine.leaveQueue(socket);
    matchingEngine.leaveChat(socket);
  });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    activeChatsCount: matchingEngine.activeChats.size,
    queueLength: matchingEngine.queue.length
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
