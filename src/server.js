const express = require('express');
const bodyParser = require('body-parser');
const http = require('http'); // use HTTP, not HTTPS
const WebSocket = require('ws');

// Express app
const app = express();
app.use(bodyParser.json());

// Maps for users and rooms
const users = new Map(); // userId => WebSocket
const rooms = new Map(); // chatId => Set<userId>
const HEARTBEAT_INTERVAL = 25000;

// Create plain HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (socket) => {
  console.log('📥 New WS connection established');
  let currentUserId = null;

  // Heartbeat ping
  const pingInterval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) socket.ping();
  }, HEARTBEAT_INTERVAL);

  socket.on('pong', () => {});

  // Handle incoming messages
  socket.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      switch (data.type) {
        case 'auth':
          currentUserId = data.data.userId;
          if (users.has(currentUserId)) {
            const oldSocket = users.get(currentUserId);
            if (oldSocket && oldSocket !== socket) oldSocket.close();
          }
          users.set(currentUserId, socket);
          socket.send(JSON.stringify({ type: 'auth-confirmation', status: 'success', userId: currentUserId }));
          break;

        case 'joinRooms':
          if (!currentUserId) return;
          data.chatIds.forEach(chatId => {
            if (!rooms.has(chatId)) rooms.set(chatId, new Set());
            rooms.get(chatId).add(currentUserId);
          });
          break;

        case 'typing':
          if (!currentUserId || !data.chatId) return;
          const room = rooms.get(data.chatId);
          room?.forEach(userId => {
            if (userId !== currentUserId) {
              const target = users.get(userId);
              if (target && target.readyState === WebSocket.OPEN) {
                target.send(JSON.stringify({
                  type: 'typing',
                  data: { chatId: data.chatId, userId: currentUserId, isTyping: data.isTyping }
                }));
              }
            }
          });
          break;

        default:
          console.warn('❓ Unknown type:', data.type);
      }
    } catch (err) {
      console.error('📛 Invalid message:', err);
    }
  });

  // Clean up on close
  socket.on('close', () => {
    users.delete(currentUserId);
    rooms.forEach(set => set.delete(currentUserId));
    clearInterval(pingInterval);
  });
});

// Broadcast endpoint
app.post('/api/broadcast', (req, res) => {
  const { chatId, senderId, reciverId } = req.body;
  const members = rooms.get(chatId);
  if (members && members.size > 0) {
    members.forEach(userId => {
      const socket = users.get(userId);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'newMessage', data: req.body }));
      }
    });
  } else {
    [senderId, reciverId].forEach(userId => {
      const socket = users.get(userId);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'newMessage', data: req.body }));
      }
    });
  }
  res.sendStatus(200);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), connections: users.size, rooms: rooms.size });
});

// Start HTTP server
server.listen(3005, '0.0.0.0', () => {
  console.log('🚀 Node WS server running on http://0.0.0.0:3005/ws');
});

// Graceful shutdown
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
