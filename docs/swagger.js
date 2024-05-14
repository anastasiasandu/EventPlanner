const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

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
    },
    apis: [path.resolve(__dirname, '../routes/*.js')], // Path to your route files
};

const specs = swaggerJsdoc(options);

module.exports = {
    specs,
    swaggerUi,
};
