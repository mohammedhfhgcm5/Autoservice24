const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const path = require('path');

// Express app
const app = express();
app.use(bodyParser.json());

// Enable CORS for API endpoints
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Maps for managing connections and rooms
const users = new Map(); // userId => { socket, lastSeen }
const rooms = new Map(); // chatId => Set<userId>
const userRooms = new Map(); // userId => Set<chatIds>

// Configuration
const HEARTBEAT_INTERVAL = 25000;
const CONNECTION_TIMEOUT = 60000;

// SSL Certificates
let server;
try {
  const sslOptions = {
    cert: fs.readFileSync('/etc/letsencrypt/live/autoservicely.com/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/autoservicely.com/privkey.pem')
  };
  server = https.createServer(sslOptions, app);
  console.log('✅ SSL certificates loaded successfully');
} catch (error) {
  console.error('❌ Failed to load SSL certificates:', error.message);
  console.log('🔄 Falling back to HTTP server for development');
  const http = require('http');
  server = http.createServer(app);
}

// WebSocket server - matching nginx path
const wss = new WebSocket.Server({ 
  server, 
  path: '/ws',
  verifyClient: (info) => {
    // Add any authentication logic here if needed
    return true;
  }
});

// Utility functions
function cleanupUser(userId) {
  if (!userId) return;
  
  users.delete(userId);
  
  // Remove user from all rooms
  const userRoomSet = userRooms.get(userId);
  if (userRoomSet) {
    userRoomSet.forEach(chatId => {
      const room = rooms.get(chatId);
      if (room) {
        room.delete(userId);
        if (room.size === 0) {
          rooms.delete(chatId);
        }
      }
    });
    userRooms.delete(userId);
  }
}

function broadcastToRoom(chatId, message, excludeUserId = null) {
  const room = rooms.get(chatId);
  if (!room) return;
  
  let sentCount = 0;
  room.forEach(userId => {
    if (userId !== excludeUserId) {
      const userConnection = users.get(userId);
      if (userConnection && userConnection.socket.readyState === WebSocket.OPEN) {
        try {
          userConnection.socket.send(JSON.stringify(message));
          sentCount++;
        } catch (error) {
          console.error(`❌ Failed to send message to user ${userId}:`, error.message);
        }
      }
    }
  });
  
  return sentCount;
}

function isAlive(socket) {
  return socket.readyState === WebSocket.OPEN;
}

// WebSocket connection handler
wss.on('connection', (socket, request) => {
  console.log(`📥 New WebSocket connection from ${request.socket.remoteAddress}`);
  
  let currentUserId = null;
  let isAuthenticated = false;
  let pingInterval = null;

  // Heartbeat mechanism
  socket.isAlive = true;
  socket.on('pong', () => {
    socket.isAlive = true;
  });

  // Start ping interval
  pingInterval = setInterval(() => {
    if (!socket.isAlive) {
      console.log(`💔 Connection timeout for user: ${currentUserId}`);
      return socket.terminate();
    }
    
    socket.isAlive = false;
    if (socket.readyState === WebSocket.OPEN) {
      socket.ping();
    }
  }, HEARTBEAT_INTERVAL);

  // Message handler
  socket.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
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
          
          // Close existing connection for this user
          if (users.has(currentUserId)) {
            const existingConnection = users.get(currentUserId);
            if (existingConnection.socket && existingConnection.socket !== socket) {
              console.log(`🔄 Replacing existing connection for user: ${currentUserId}`);
              existingConnection.socket.close(1000, 'New connection established');
            }
          }

          // Register new connection
          users.set(currentUserId, {
            socket: socket,
            lastSeen: new Date()
          });
          
          isAuthenticated = true;
          
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

          // Initialize user rooms set if not exists
          if (!userRooms.has(currentUserId)) {
            userRooms.set(currentUserId, new Set());
          }

          const userRoomSet = userRooms.get(currentUserId);
          
          data.chatIds.forEach(chatId => {
            if (!rooms.has(chatId)) {
              rooms.set(chatId, new Set());
            }
            rooms.get(chatId).add(currentUserId);
            userRoomSet.add(chatId);
          });

          socket.send(JSON.stringify({
            type: 'rooms-joined',
            chatIds: data.chatIds,
            timestamp: new Date().toISOString()
          }));
          
          console.log(`🏠 User ${currentUserId} joined ${data.chatIds.length} rooms`);
          break;

        case 'leaveRoom':
          if (!isAuthenticated || !data.chatId) return;
          
          const room = rooms.get(data.chatId);
          if (room) {
            room.delete(currentUserId);
            if (room.size === 0) {
              rooms.delete(data.chatId);
            }
          }
          
          const userRooms_set = userRooms.get(currentUserId);
          if (userRooms_set) {
            userRooms_set.delete(data.chatId);
          }
          
          console.log(`🚪 User ${currentUserId} left room: ${data.chatId}`);
          break;

        case 'typing':
          if (!isAuthenticated || !data.chatId) return;
          
          const sentCount = broadcastToRoom(data.chatId, {
            type: 'typing',
            data: {
              chatId: data.chatId,
              userId: currentUserId,
              isTyping: data.isTyping || false,
              timestamp: new Date().toISOString()
            }
          }, currentUserId);
          
          console.log(`⌨️  Typing notification sent to ${sentCount} users in room ${data.chatId}`);
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
    } catch (error) {
      console.error('📛 Error processing message:', error.message);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  // Connection close handler
  socket.on('close', (code, reason) => {
    console.log(`📤 WebSocket connection closed for user: ${currentUserId}, code: ${code}, reason: ${reason}`);
    
    if (pingInterval) {
      clearInterval(pingInterval);
    }
    
    cleanupUser(currentUserId);
  });

  // Error handler
  socket.on('error', (error) => {
    console.error(`❌ WebSocket error for user ${currentUserId}:`, error.message);
    cleanupUser(currentUserId);
  });

  // Send welcome message
  socket.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connection established',
    timestamp: new Date().toISOString()
  }));
});

// Periodic cleanup of inactive connections
setInterval(() => {
  wss.clients.forEach((socket) => {
    if (!socket.isAlive) {
      return socket.terminate();
    }
  });
}, CONNECTION_TIMEOUT);

// REST API Endpoints

// Broadcast message to chat room
app.post('/api/broadcast', (req, res) => {
  try {
    const { chatId, senderId, receiverId, message, messageType } = req.body;
    
    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    const broadcastData = {
      type: 'newMessage',
      data: {
        chatId,
        senderId,
        receiverId,
        message,
        messageType,
        timestamp: new Date().toISOString(),
        ...req.body
      }
    };

    let sentCount = 0;
    const room = rooms.get(chatId);
    
    if (room && room.size > 0) {
      // Broadcast to all room members
      sentCount = broadcastToRoom(chatId, broadcastData);
    } else {
      // Fallback: send directly to sender and receiver
      [senderId, receiverId].forEach(userId => {
        if (userId) {
          const userConnection = users.get(userId);
          if (userConnection && userConnection.socket.readyState === WebSocket.OPEN) {
            try {
              userConnection.socket.send(JSON.stringify(broadcastData));
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

// Get active connections info
app.get('/api/status', (req, res) => {
  const activeConnections = Array.from(users.entries()).map(([userId, connection]) => ({
    userId,
    connected: connection.socket.readyState === WebSocket.OPEN,
    lastSeen: connection.lastSeen
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: users.size,
    rooms: rooms.size,
    uptime: process.uptime()
  });
});

// Get user's rooms
app.get('/api/user/:userId/rooms', (req, res) => {
  const { userId } = req.params;
  const userConnection = users.get(userId);
  const userRoomSet = userRooms.get(userId);
  
  res.json({
    userId,
    online: userConnection ? userConnection.socket.readyState === WebSocket.OPEN : false,
    rooms: userRoomSet ? Array.from(userRoomSet) : [],
    lastSeen: userConnection ? userConnection.lastSeen : null
  });
});

// Force disconnect user
app.post('/api/user/:userId/disconnect', (req, res) => {
  const { userId } = req.params;
  const userConnection = users.get(userId);
  
  if (userConnection) {
    userConnection.socket.close(1000, 'Forced disconnect');
    res.json({ success: true, message: `User ${userId} disconnected` });
  } else {
    res.status(404).json({ error: 'User not found or not connected' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('WebSocket Chat Server is running! 🚀');
});

// Start server
const PORT = process.env.PORT || 3005;
const HOST = process.env.HOST || '127.0.0.1';

server.listen(PORT, HOST, () => {
  const protocol = server instanceof https.Server ? 'https' : 'http';
  console.log(`🚀 ${protocol.toUpperCase()} + WebSocket server running on ${protocol}://${HOST}:${PORT}`);
  console.log(`📡 WebSocket endpoint: wss://${HOST}:${PORT}/ws`);
  console.log(`🏥 Health check: ${protocol}://${HOST}:${PORT}/health`);
  console.log(`📊 Status endpoint: ${protocol}://${HOST}:${PORT}/api/status`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  
  // Close all WebSocket connections
  wss.clients.forEach((socket) => {
    socket.close(1001, 'Server shutting down');
  });
  
  // Close HTTP server
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('✅ WebSocket Chat Server initialized successfully');