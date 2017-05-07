const express = require('express');
const createEventRouter = require('./event-router');
const eventFeature = require('..//features/event/event-feature');

const createRootRouter = () => {
  const rootRouter = express.Router();
  // Set all the feature routes
  rootRouter.use('/event', createEventRouter(eventFeature));
  return rootRouter;
};

module.exports = createRootRouter;
