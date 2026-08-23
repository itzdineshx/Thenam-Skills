import { app } from './app';
import { env } from './config/env';
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer(app);

// Initialize Socket.io
export const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      env.CLIENT_URL
    ].filter(Boolean) as string[],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  
  socket.on('create_event', (eventData) => {
    io.emit('new_event_notification', eventData);
  });
  
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

const startServer = () => {
  // Start listening on Port immediately via httpServer, not app
  httpServer.listen(env.PORT, () => {
    console.log(`[Server] THENAM Skills API running in [${env.NODE_ENV}] mode on port: ${env.PORT}`);
    console.log(`[Server] Access control origin locked to client: ${env.CLIENT_URL}`);
  });
};

try {
  startServer();
} catch (error) {
  console.error('[Server] Critical server startup exception:', error);
  process.exit(1);
}
