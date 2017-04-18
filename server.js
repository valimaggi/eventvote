const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();
const API_PREFIX = require('./config/properties').API_PREFIX;
const eventRoutes = require('./routes/event-routes');
const eventFeature = require('./features/event-feature');

const app = express();
// Some security to Express app
app.use(helmet.hidePoweredBy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
const sixtyDaysInSeconds = 5184000;
app.use(helmet.hsts({ maxAge: sixtyDaysInSeconds }));
// Body-parser parses JSON requests
app.use(bodyParser.json());
// API logging
app.use(morgan('dev'));

// Database connection. Set the native ES6 promise to mongoose since
// mongoose's mpromise is deprecated
mongoose.Promise = Promise;
mongoose.connect(process.env.DB_URI, { user: process.env.DB_USER, pass: process.env.DB_PASS })
.then(() => {
  // db.on('error', console.error.bind(console, 'Connection error:'));
  // Setting routes
  const router = new express.Router();
  eventRoutes(router, eventFeature);

  // API prefix for the main router
  app.use(API_PREFIX, router);

  // Start the server
  const port = process.env.SERVER_PORT;
  app.listen(port);
  console.log('Listening on port ' + port);
})
.catch((error) => {
  console.log(`Connection error: ${error}`);
  process.exit(0);
});
