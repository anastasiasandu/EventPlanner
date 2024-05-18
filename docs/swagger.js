const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const jwtDecode = require('jwt-decode'); // Import jwt-decode library

const options = {
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
    apis: [path.resolve(__dirname, '../routes/*.js')], // Path to your route files
};

const specs = swaggerJsdoc(options);

// Extend Swagger UI to include authorization functionality
const swaggerUiAuth = (req, res, next) => {
    // Check if request path matches Swagger UI URL
    if (req.url === '/api-docs/') {
        // Inject custom JavaScript to handle authorization
        res.send(`
            <script>
                // Function to add authorization token to requests
                function addAuthorization() {
                    const token = localStorage.getItem('token'); // Get token from localStorage
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

module.exports = {
    specs,
    swaggerUi: [swaggerUi.serve, swaggerUi.setup(specs), swaggerUiAuth], // Include swaggerUiAuth middleware
};
