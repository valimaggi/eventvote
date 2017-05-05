const express = require('express');
const createEventRouter = require('./features/event/event-routes');
const eventFeature = require('./features/event/event-feature');

const createRootRouter = () => {
  const rootRouter = express.Router();
  // Set all the feature routes
  rootRouter.use('/event', createEventRouter(eventFeature));
  return rootRouter;
};

module.exports = createRootRouter;
