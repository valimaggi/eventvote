const createEventWithVotesFactory = (eventName, eventDates) =>
  (eventIdObject, votes) =>
    Object.assign(eventIdObject,
      {
        name: eventName,
        dates: eventDates,
        votes: votes
      }
    );

const createErrorObject = invalidId => ({
  message: 'Cast to ObjectId failed for value ' + invalidId + ' at path \'_id\'',
  name: 'CastError',
  kind: 'ObjectId',
  value: invalidId,
  path: '_id'
});

module.exports = { createEventWithVotesFactory, createErrorObject };
