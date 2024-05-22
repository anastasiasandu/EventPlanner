const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { connect } = require('./prisma/connection');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const postRoutes = require('./routes/post'); // Import Post routes
const { swaggerUi, specs } = require('./docs/swagger'); // Import Swagger setup

dotenv.config();

const app = express();

const whitelist = ['http://localhost:3000', 'ws://localhost:3000'];
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(cookieParser());

// Setup Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/post', postRoutes); // Use Post routes

async function listen() {
  await connect();
  app.listen(8000, () => {
    console.log('server running on 8000');
  });
}

listen();

module.exports = app;
