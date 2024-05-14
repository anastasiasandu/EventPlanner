// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Routes
const authRoutes = require('./routes/auth'); // Import auth.js directly
const eventRoutes = require('./routes/events');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Express app
const app = express();

// Database connection
mongoose.connect('mongodb://localhost/eventplanner', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes); // Mount authRoutes at /auth
app.use('/events', eventRoutes);

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    const address = server.address();
    const host = address.address === '::' ? 'localhost' : address.address;
    const port = address.port;
    console.log(`Server running at http://${host}:${port}/`);
});

