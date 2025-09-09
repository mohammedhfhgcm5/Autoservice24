const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// WebSocket + API Server
const app = express();
app.use(bodyParser.json());

// Maps
const users = new Map(); // userId => WebSocket
const rooms = new Map(); // chatId => Set<userId>

// Heartbeat settings
const HEARTBEAT_INTERVAL = 25000;

// SSL Certificate paths (using your Let's Encrypt certificates)
const SSL_CONFIG = {
  key: fs.readFileSync('/etc/letsencrypt/live/autoservicely.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/autoservicely.com/fullchain.pem')
};

// Create HTTPS server
const httpsServer = https.createServer(SSL_CONFIG, app);
const wss = new WebSocket.Server({ 
  server: httpsServer, 
  path: '/' 
});

// Optional: Create HTTP server for redirects
const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(301, `https://${req.headers.host}${req.url}`);
});
const httpServer = http.createServer(httpApp);

wss.on('connection', (socket) => {
  console.log('📥 New connection established');
  let currentUserId = null;

  const pingInterval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.ping();
    }
  }, HEARTBEAT_INTERVAL);

  socket.on('pong', () => {
    // Alive
  });

  socket.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log('📨 Received:', data);

      switch (data.type) {
        case 'auth':
          currentUserId = data.data.userId;
          if (users.has(currentUserId)) {
            const oldSocket = users.get(currentUserId);
            if (oldSocket && oldSocket !== socket) oldSocket.close();
          }
          users.set(currentUserId, socket);
          console.log(`✅ Authenticated user ${currentUserId}`);

          socket.send(
            JSON.stringify({
              type: 'auth-confirmation',
              status: 'success',
              userId: currentUserId,
            }),
          );
          break;

        case 'joinRooms':
          if (!currentUserId) return;
          data.chatIds.forEach((chatId) => {
            if (!rooms.has(chatId)) rooms.set(chatId, new Set());
            rooms.get(chatId).add(currentUserId);
          });
          console.log(`🚪 User ${currentUserId} joined rooms:`, data.chatIds);
          break;

        case 'typing':
          if (!currentUserId || !data.chatId) return;
          const room = rooms.get(data.chatId);
          room?.forEach((userId) => {
            if (userId !== currentUserId) {
              const target = users.get(userId);
              if (target && target.readyState === WebSocket.OPEN) {
                target.send(
                  JSON.stringify({
                    type: 'typing',
                    data: {
                      chatId: data.chatId,
                      userId: currentUserId,
                      isTyping: data.isTyping,
                    },
                  }),
                );
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

  socket.on('close', () => {
    console.log(`❌ Connection closed for user ${currentUserId}`);
    users.delete(currentUserId);
    rooms.forEach((set) => set.delete(currentUserId));
    clearInterval(pingInterval);
  });
});

// ✅ Broadcast endpoint from NestJS
app.post('/api/broadcast', (req, res) => {
  const message = req.body;
  const { chatId, senderId, reciverId } = message;

  const members = rooms.get(chatId);

  if (members && members.size > 0) {
    members.forEach((userId) => {
      const socket = users.get(userId);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'newMessage', data: message }));
        console.log(`✅ Message sent to user ${userId}`);
      }
    });
  } else {
    console.log(
      `⚠️ No room found. Using fallback for users ${senderId}, ${reciverId}`,
    );
    [senderId, reciverId].forEach((userId) => {
      const socket = users.get(userId);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'newMessage', data: message }));
        console.log(`✅ [Fallback] Message sent to user ${userId}`);
      }
    });
  }

  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connections: users.size,
    rooms: rooms.size
  });
});

// Start HTTPS server (port 3005)
httpsServer.listen(3005, () => {
  console.log('🚀 HTTPS WebSocket + API server running on https://localhost:3005');
  console.log('🔒 SSL/TLS enabled with Let\'s Encrypt certificates');
});

// Start HTTP server for redirects (port 3006)
httpServer.listen(3006, () => {
  console.log('🔄 HTTP redirect server running on http://localhost:3006');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  httpsServer.close(() => {
    httpServer.close(() => {
      console.log('✅ Servers closed gracefully');
      process.exit(0);
    });
  });
});