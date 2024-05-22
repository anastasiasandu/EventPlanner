const express = require('express')
const auth =  require('./server_1/routes/auth')
const cors = require('cors')
const dotenv = require('dotenv')
const {activate} = require('./server_1/handlers/auth')
const {connect} = require('./server_1/prisma/connection')
const { swaggerUi, specs } = require('./swagger'); // Import Swagger
const debug = require('debug')('app:server');

dotenv.config()

const app = express()

var whitelist = ['http://localhost:3000', 'ws://localhost:3000']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true, credentials: true } // reflect (enable) the requested origin in the CORS response
    
} else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  
  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate))

app.use(express.json())

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/auth', auth)
//app.get('/activate', activate)




async function listen () {
  await connect()
  app.listen('8000', ()=>{console.log('server running on 8000')})
}

listen()

