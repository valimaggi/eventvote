const express = require('express');
const validation = require('./event-validation');
const composeErrorHandlers = require('../error-handlers').composeErrorHandlers;
const resourceNotFound = require('../error-handlers').resourceNotFound;
const vote = require('./event-error-handlers').vote;
const invalidId = require('./event-error-handlers').invalidId;

const createEventRouter = (feature) => {
  const router = new express.Router();
  // Route definitions
  router.get('/list', feature.getAllEvents, ...composeErrorHandlers());
  router.get('/:id', feature.getEvent, ...composeErrorHandlers(invalidId, resourceNotFound));
  router.post('', validation.create, feature.createEvent);
  router.post('/:id/vote', validation.castVote, feature.castVote, ...composeErrorHandlers(vote, invalidId, resourceNotFound));
  router.get('/:id/results', feature.getResults);
  router.delete('', feature.deleteAllEvents);
  return router;
};

module.exports = createEventRouter;
