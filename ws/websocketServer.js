const WebSocket = require('ws');
const clients = new Set();

function broadcastToClients(data) {
  console.log('📢 Broadcasting to clients:', data);
  console.log('Clients count:', clients.size);

  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function initWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  console.log('📡 WebSocket server started');

  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket client connected');
    clients.add(ws);

    ws.on('message', (msg) => {
      console.log('📨 Received message from client:', msg.toString());
    });

    ws.on('close', () => {
      console.log('❌ WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('⚠️ WebSocket error:', err);
    });
  });

}

module.exports = {
  initWebSocketServer,
  broadcastToClients,
};
