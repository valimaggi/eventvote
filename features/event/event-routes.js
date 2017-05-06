const express = require('express');
const validation = require('./event-validation');

const createEventRouter = (feature) => {
  const router = new express.Router();

  // Route definitions
  router.get('/list', feature.getAllEvents);
  router.get('/:id', feature.getEvent);
  router.post('', validation.create, feature.createEvent);
  router.post('/:id/vote', validation.castVote, feature.castVote);
  router.get('/:id/results', feature.getResults);
  router.delete('', feature.deleteAllEvents);
  return router;
};

module.exports = createEventRouter;
