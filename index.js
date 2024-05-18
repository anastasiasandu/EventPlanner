const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path'); // Import path module

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // Import user routes
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

const app = express();

mongoose.connect('mongodb://localhost/eventplanner', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(bodyParser.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Event Planner API',
            version: '1.0.0',
            description: 'API documentation for Event Planner application',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Change this to match your server URL
                description: 'Local server',
            },
        ],
        components: { // Add components section for securitySchemes
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [path.resolve(__dirname, './routes/*.js')], // Path to your route files
};

const specs = swaggerJsdoc(swaggerOptions);

// Extend Swagger UI to include authorization functionality
const swaggerUiAuth = (req, res, next) => {
    // Check if request path matches Swagger UI URL
    if (req.url === '/api-docs/') {
        // Get the token from the request headers if it exists
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;

        // Inject custom JavaScript to handle authorization
        res.send(`
            <script>
                // Function to add authorization token to requests
                function addAuthorization() {
                    const token = '${token}'; // Get token from the authorization header
                    if (token) {
                        const authHeader = 'Bearer ' + token;
                        // Set authorization header for Swagger UI requests
                        window.ui.api.clientAuthorizations.authz = { 
                            'Authorization': authHeader 
                        };
                    }
                }

                // Add authorization token on page load
                window.onload = () => {
                    addAuthorization();
                };

                // Event listener for changes in localStorage (e.g., token refresh)
                window.addEventListener('storage', () => {
                    addAuthorization();
                });
            </script>
        `);
    } else {
        next(); // Pass request to the next middleware
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/auth', authRoutes);
app.use('/users', userRoutes); // Mount user routes

// Apply auth middleware to routes except /auth/login, /auth/signup, /api-docs, /, and /users
app.use((req, res, next) => {
    if (req.path === '/auth/login' || req.path === '/auth/signup' || req.path.startsWith('/api-docs') || req.path === '/') {
        // Skip authentication for login, signup, api-docs, root, and user routes
        return next();
    }
    authMiddleware(req, res, next);
});

// Default route
app.use('/', (req, res) => {
    res.send('Welcome to the API');
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    const address = server.address();
    const host = address.address === '::' ? 'localhost' : address.address;
    const port = address.port;
    console.log(`Server running at http://${host}:${port}/`);
});
