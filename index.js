const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const errorHandler = require('./middleware/errorHandler');

const app = express();

mongoose.connect('mongodb://localhost/eventplanner', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(bodyParser.json());

function extractRoutes(filePath) {
    const routes = [];
    const router = require(filePath);
    router.stack.forEach(layer => {
        if (layer.route) {
            const { path, methods } = layer.route;
            // Exclude routes with unwanted methods
            if (!methods.delete && !methods.put) {
                routes.push({ path, methods });
            }
        }
    });
    return routes;
}

// Define Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Event Planner API',
            version: '1.0.0',
            description: 'API documentation for Event Planner application',
        },
    },
    apis: ['./routes/*.js'], // Path to the API routes
};

// Initialize Swagger-jsdoc
const specs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Define routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);

// Define routes for Swagger documentation
app.get('/routes', (req, res) => {
    const routes = [];

    app._router.stack.forEach(layer => {
        if (layer.route && !layer.route.path.startsWith('/routes')) {
            const { path, methods } = layer.route;
            routes.push({ path, methods });
        }
    });

    const authRoutesPath = path.join(__dirname, 'routes', 'auth.js');
    if (fs.existsSync(authRoutesPath)) {
        const authRoutes = extractRoutes(authRoutesPath);
        routes.push(...authRoutes);
    }

    const eventRoutesPath = path.join(__dirname, 'routes', 'events.js');
    if (fs.existsSync(eventRoutesPath)) {
        const eventRoutes = extractRoutes(eventRoutesPath);
        routes.push(...eventRoutes);
    }

    res.json({ routes });
});

// Default route
app.use('/', (req, res) => {
    res.send('Welcome to the API');
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    const address = server.address();
    const host = address.address === '::' ? 'localhost' : address.address;
    const port = address.port;
    console.log(`Server running at http://${host}:${port}/`);
});
