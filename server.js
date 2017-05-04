const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();
const API_PREFIX = require('./config/properties').API_PREFIX;
const createEventRouter = require('./features/event/event-routes');
const eventFeature = require('./features/event/event-feature');

const app = express();
// Some security to Express app
app.use(helmet.hidePoweredBy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
const SIXTY_DAYS_IN_SECONDS = 5184000;
app.use(helmet.hsts({ maxAge: SIXTY_DAYS_IN_SECONDS }));
// Body-parser parses JSON requests
app.use(bodyParser.json());
// API logging
app.use(morgan('dev'));

// Database connection. Set the native ES6 promise to mongoose since
// mongoose's mpromise is deprecated
mongoose.Promise = Promise;
mongoose.connect(process.env.DB_URI, { user: process.env.DB_USER, pass: process.env.DB_PASS })
.then(() => {
  // Setting routes
  const rootRouter = new express.Router();
  rootRouter.use('/event', createEventRouter(eventFeature));

  // API prefix for the root router
  app.use(API_PREFIX, rootRouter);

  // Start the server
  const port = process.env.SERVER_PORT;
  if (!port) throw new Error('No port');
  app.listen(port);
  console.log(`Listening on port ${port}`);
})
.catch((error) => {
  console.log(`Connection error: ${error}`);
  process.exit(0);
});
