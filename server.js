const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const database = require('./config/database');
const applyMiddleware = require('./common/middleware').applyMiddleware;
const helmetFunctions = require('./config/security');
require('dotenv').config();
const API_PREFIX = require('./config/properties').API_PREFIX;
const createEventRouter = require('./features/event/event-routes');
const eventFeature = require('./features/event/event-feature');

const app = applyMiddleware(
  morgan('dev'), // API logging
  bodyParser.json(), // JSON requests
  ...helmetFunctions // HTTP header setting functions for some security
  )(express());

// Database connection. Set the native ES6 promise to mongoose since
// mongoose's mpromise is deprecated
database.connect(process.env.DB_URI, process.env.DB_USER, process.env.DB_PASS)
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
