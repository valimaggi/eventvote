const createEventWithVotesFactory = (eventName, eventDates) =>
  (eventIdObject, votes) =>
    Object.assign(eventIdObject,
      {
        name: eventName,
        dates: eventDates,
        votes: votes
      }
    );

module.exports = { createEventWithVotesFactory };
