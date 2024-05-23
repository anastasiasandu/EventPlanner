const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { connect } = require('./prisma/connection');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const postRoutes = require('./routes/post');
const { swaggerUi, specs } = require('./docs/swagger');

dotenv.config();

const app = express();
let server; // Variable to hold the server instance

const whitelist = ['http://localhost:3000', 'ws://localhost:3000', 'http://127.0.0.1:8000'];
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

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/post', postRoutes);

async function listen() {
  await connect();
  server = app.listen(8000, () => {
    console.log('server running on 8000');
  });
  return server; // Return the server instance
}

listen();

function closeServer() {
  if (server) {
    server.close(() => {
      console.log('server closed');
    });
  }
}

module.exports = { closeServer, app };
