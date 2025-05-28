const express = require('express');
const app = express();
require('dotenv').config(); // nếu dùng .env

// Middleware để parse JSON
app.use(express.json());

// Mount tất cả các routes
app.use('/api/flights', require('./routes/flights'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/ticket-classes', require('./routes/ticketClasses'));

// Default route
app.get('/', (req, res) => {
  res.send('QAirline API is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));