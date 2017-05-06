const express = require('express');
const Celebrate = require('celebrate');
const { create, castVote } = require('./event-schemas');
const { composeErrorHandlers, resourceNotFound } = require('../error-handlers');
const { vote, invalidId, validation } = require('./event-error-handlers');

const createEventRouter = (feature) => {
  const router = new express.Router();
  // Route definitions
  router.get('/list', feature.getAllEvents, ...composeErrorHandlers());
  router.get('/:id', feature.getEvent, ...composeErrorHandlers(invalidId, resourceNotFound));
  router.post('', Celebrate(create), feature.createEvent, ...composeErrorHandlers(validation));
  router.post('/:id/vote', Celebrate(castVote), feature.castVote, ...composeErrorHandlers(vote, invalidId, resourceNotFound, validation));
  router.get('/:id/results', feature.getResults, ...composeErrorHandlers(invalidId, resourceNotFound));
  router.delete('', feature.deleteAllEvents, ...composeErrorHandlers());
  return router;
};

module.exports = createEventRouter;
