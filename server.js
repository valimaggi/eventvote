const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const winston = require('winston');
require('dotenv').config(); // load env varialbes from .env file
const database = require('./config/database');
const { applyMiddleware, invalidJSONErrorHandler, serverErrorHandler } = require('./common/middleware');
const helmetFunctions = require('./config/security');
const { API_PREFIX } = require('./config/properties');
const createRootRouter = require('./root-router');

const app = applyMiddleware(
  morgan('dev'), // API logging
  bodyParser.json(), // JSON requests
  ...helmetFunctions, // HTTP header setting functions for some security
  invalidJSONErrorHandler,
  serverErrorHandler
  )(express());

database.connect(process.env.DB_URI, process.env.DB_USER, process.env.DB_PASS)
.then(() => {
  // Set the root router with the API prefix
  app.use(API_PREFIX, createRootRouter());

  // Start the server
  const port = process.env.SERVER_PORT;
  if (!port) throw new Error('No port given');
  app.listen(port);
  winston.info(`Listening on port ${port}`);
})
.catch((error) => {
  winston.error(error);
  process.exit(0);
});
