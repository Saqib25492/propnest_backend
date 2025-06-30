const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;
const http = require('http');
const { initWebSocketServer } = require('./ws/websocketServer');

connectDB().then(() => {

  const server = http.createServer(app);

  initWebSocketServer(server);

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

