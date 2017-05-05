const express = require('express');

const createEventRouter = (feature) => {
  const router = new express.Router();

  // Route definitions
  router.get('/list', feature.getAllEvents);
  router.get('/:id', feature.getEvent);
  router.post('', feature.createEvent);
  router.post('/:id/vote', feature.castVote);
  router.get('/:id/results', feature.getResults);
  router.delete('', feature.deleteAllEvents);
  return router;
};

module.exports = createEventRouter;
