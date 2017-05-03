const express = require('express');

function createEventRouter(service) {
  const router = new express.Router();

  // Route definitions
  router.get('/list', service.getAllEvents);
  router.get('/:id', service.getEvent);
  router.post('', service.createEvent);
  router.post('/:id/vote', service.castVote);
  router.get('/:id/results', service.getResults);
  router.delete('', service.deleteAllEvents);
  return router;
}

module.exports = createEventRouter;
