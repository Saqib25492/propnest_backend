const { broadcastToClients } = require('../ws/broadcaster');
broadcastToClients({ event: 'media_uploaded', propertyId: 'abc123' });
