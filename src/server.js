const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

// Express app
const app = express();
app.use(bodyParser.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Maps
const users = new Map(); // userId => WebSocket
const rooms = new Map(); // chatId => Set<userId>
const HEARTBEAT_INTERVAL = 25000;

// SSL Certificates
let server;
try {
  server = https.createServer({
    cert: fs.readFileSync('/etc/letsencrypt/live/autoservicely.com/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/autoservicely.com/privkey.pem')
  }, app);
  console.log('✅ SSL certificates loaded successfully');
} catch (error) {
  console.error('❌ SSL certificate error:', error.message);
  process.exit(1);
}

// WebSocket server
const wss = new WebSocket.Server({ 
  server, 
  path: '/ws',
  verifyClient: (info) => {
    console.log(`📡 WebSocket connection attempt from: ${info.req.socket.remoteAddress} to path: ${info.req.url}`);
    return true; // Accept all connections
  }
});

console.log('🔌 WebSocket server created with path: /ws');

wss.on('connection', (socket, request) => {
  console.log(`📥 New WebSocket connection established from: ${request.socket.remoteAddress}`);
  
  let currentUserId = null;
  let isAuthenticated = false;

  // Send welcome message immediately
  socket.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connection established successfully',
    timestamp: new Date().toISOString()
  }));

  // Heartbeat mechanism
  socket.isAlive = true;
  const pingInterval = setInterval(() => {
    if (!socket.isAlive) {
      console.log(`💔 Connection timeout for user: ${currentUserId}`);
      return socket.terminate();
    }
    socket.isAlive = false;
    if (socket.readyState === WebSocket.OPEN) {
      socket.ping();
    }
  }, HEARTBEAT_INTERVAL);

  socket.on('pong', () => {
    socket.isAlive = true;
  });

  socket.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      console.log(`📨 Received message type: ${data.type} from user: ${currentUserId}`);
      
      switch (data.type) {
        case 'auth':
          if (!data.data || !data.data.userId) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Invalid authentication data'
            }));
            return;
          }

          currentUserId = data.data.userId;
          isAuthenticated = true;
          
          // Close existing connection for this user
          if (users.has(currentUserId)) {
            const oldSocket = users.get(currentUserId);
            if (oldSocket && oldSocket !== socket) {
              console.log(`🔄 Replacing existing connection for user: ${currentUserId}`);
              oldSocket.close();
            }
          }
          
          users.set(currentUserId, socket);
          socket.send(JSON.stringify({ 
            type: 'auth-confirmation', 
            status: 'success', 
            userId: currentUserId,
            timestamp: new Date().toISOString()
          }));
          console.log(`✅ User authenticated: ${currentUserId}`);
          break;

        case 'joinRooms':
          if (!isAuthenticated) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Authentication required'
            }));
            return;
          }
          
          if (!data.chatIds || !Array.isArray(data.chatIds)) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Invalid chatIds provided'
            }));
            return;
          }

          data.chatIds.forEach(chatId => {
            if (!rooms.has(chatId)) rooms.set(chatId, new Set());
            rooms.get(chatId).add(currentUserId);
          });
          
          socket.send(JSON.stringify({
            type: 'rooms-joined',
            chatIds: data.chatIds,
            timestamp: new Date().toISOString()
          }));
          console.log(`🏠 User ${currentUserId} joined ${data.chatIds.length} rooms`);
          break;

        case 'typing':
          if (!isAuthenticated || !data.chatId) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Authentication required or invalid chatId'
            }));
            return;
          }
          
          const room = rooms.get(data.chatId);
          if (room) {
            room.forEach(userId => {
              if (userId !== currentUserId) {
                const target = users.get(userId);
                if (target && target.readyState === WebSocket.OPEN) {
                  target.send(JSON.stringify({ 
                    type: 'typing', 
                    data: { 
                      chatId: data.chatId, 
                      userId: currentUserId, 
                      isTyping: data.isTyping || false,
                      timestamp: new Date().toISOString()
                    } 
                  }));
                }
              }
            });
          }
          console.log(`⌨️  Typing indicator sent for user ${currentUserId} in room ${data.chatId}`);
          break;

        case 'ping':
          socket.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          break;

        default:
          console.warn(`❓ Unknown message type: ${data.type}`);
          socket.send(JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${data.type}`
          }));
      }
    } catch (err) {
      console.error('📛 Error processing message:', err.message);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  socket.on('close', (code, reason) => {
    console.log(`📤 WebSocket connection closed for user: ${currentUserId}, code: ${code}, reason: ${reason}`);
    if (currentUserId) {
      users.delete(currentUserId);
      rooms.forEach(set => set.delete(currentUserId));
    }
    clearInterval(pingInterval);
  });

  socket.on('error', (error) => {
    console.error(`❌ WebSocket error for user ${currentUserId}:`, error.message);
  });
});

// Broadcast endpoint
app.post('/api/broadcast', (req, res) => {
  try {
    const { chatId, senderId, receiverId } = req.body;
    
    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    const broadcastData = {
      type: 'newMessage',
      data: {
        ...req.body,
        timestamp: new Date().toISOString()
      }
    };

    let sentCount = 0;
    const members = rooms.get(chatId);
    
    if (members && members.size > 0) {
      // Broadcast to room members
      members.forEach(userId => {
        const socket = users.get(userId);
        if (socket && socket.readyState === WebSocket.OPEN) {
          try {
            socket.send(JSON.stringify(broadcastData));
            sentCount++;
          } catch (error) {
            console.error(`❌ Failed to send to user ${userId}:`, error.message);
          }
        }
      });
    } else {
      // Fallback: send to sender and receiver directly
      [senderId, receiverId].forEach(userId => {
        if (userId) {
          const socket = users.get(userId);
          if (socket && socket.readyState === WebSocket.OPEN) {
            try {
              socket.send(JSON.stringify(broadcastData));
              sentCount++;
            } catch (error) {
              console.error(`❌ Failed to send to user ${userId}:`, error.message);
            }
          }
        }
      });
    }

    console.log(`📢 Broadcast sent to ${sentCount} users in chat ${chatId}`);
    res.json({ 
      success: true, 
      sentCount,
      chatId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Broadcast error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    connections: users.size, 
    rooms: rooms.size,
    uptime: process.uptime()
  });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  const activeConnections = Array.from(users.entries()).map(([userId, socket]) => ({
    userId,
    connected: socket.readyState === WebSocket.OPEN
  }));

  const roomsInfo = Array.from(rooms.entries()).map(([chatId, userSet]) => ({
    chatId,
    userCount: userSet.size,
    users: Array.from(userSet)
  }));

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeConnections: users.size,
    totalRooms: rooms.size,
    connections: activeConnections,
    rooms: roomsInfo,
    serverUptime: process.uptime()
  });
});

// Default route
app.get('/', (req, res) => {
  res.send('WebSocket Chat Server is running! 🚀');
});

// Start HTTPS server
const PORT = 3005;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`🚀 HTTPS + WebSocket server running on https://${HOST}:${PORT}`);
  console.log(`📡 WebSocket endpoint: wss://${HOST}:${PORT}/ws`);
  console.log(`🏥 Health check: https://${HOST}:${PORT}/health`);
  console.log(`📊 Status endpoint: https://${HOST}:${PORT}/api/status`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  
  // Close all WebSocket connections
  wss.clients.forEach((socket) => {
    socket.close(1001, 'Server shutting down');
  });
  
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  server.close(() => process.exit(0));
});

console.log('✅ WebSocket Chat Server initialized successfully');