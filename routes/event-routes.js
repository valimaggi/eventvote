const express = require('express');

const eventRoute = (mainRouter, service) => {
  const router = new express.Router();
  // Mount the new router to the given main router with the route prefix
  mainRouter.use('/event', router);

  // Route definitions
  router.get('/list', service.getAllEvents);
  router.get('/:id', service.getEvent);
  router.post('', service.createEvent);
  router.post('/:id/vote', service.castVote);
  router.get('/:id/results', service.getResults);
  router.delete('', service.deleteAllEvents);
};

module.exports = eventRoute;
