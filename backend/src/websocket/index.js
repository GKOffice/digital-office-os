import { logger } from '../utils/logger.js';

export function setupWebSocket(io) {
  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected');
    
    // Subscribe to creator updates
    socket.on('subscribe:creator', (creatorId) => {
      socket.join(`creator:${creatorId}`);
      logger.debug({ creatorId }, 'Subscribed to creator');
    });
    
    // Subscribe to agent updates
    socket.on('subscribe:agent', (agentId) => {
      socket.join(`agent:${agentId}`);
    });
    
    // Subscribe to approvals
    socket.on('subscribe:approvals', () => {
      socket.join('approvals');
    });
    
    // Unsubscribe
    socket.on('unsubscribe:creator', (creatorId) => {
      socket.leave(`creator:${creatorId}`);
    });
    
    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Client disconnected');
    });
  });
  
  // Helper to emit events
  return {
    emitActivity(creatorId, entry) {
      io.to(`creator:${creatorId}`).emit('activity:new', { creatorId, entry });
    },
    emitMetricUpdate(creatorId, metrics) {
      io.to(`creator:${creatorId}`).emit('metric:update', { creatorId, metrics });
    },
    emitApproval(approval) {
      io.to('approvals').emit('approval:new', { approval });
    },
    emitAlert(alert) {
      io.emit('alert:critical', { alert });
    }
  };
}
