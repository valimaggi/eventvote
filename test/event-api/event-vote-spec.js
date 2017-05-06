const sinon = require('sinon');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const initRequest = require('../test-helpers').initRequest;
const createEventWithVotesFactory = require('./utils').createEventWithVotesFactory;
const createEventRouter = require('../../features/event/event-routes');
const errors = require('../../features/event/event-error-handlers').errors;
const commonMessages = require('../../common/messages');
const eventMessages = require('../../features/event/messages');

describe('POST /event/:id/vote', () => {
  let createEventRouterRequest;
  let stubForGetOneById;
  let stubForUpdate;
  let request;

  before(() => {
    createEventRouterRequest = initRequest(bodyParser.json());
    stubForGetOneById = sinon.stub();
    stubForUpdate = sinon.stub();
    request = createEventRouterRequest(createEventRouter, '../features/event/event-feature', {
      './event-model': {
        getOneById: stubForGetOneById,
        update: stubForUpdate
      }
    });
  });

  it('should respond with a 200 when making a valid vote', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';
    const testVoteDate = '2014-01-12';
    const testVoteDates = ['2014-01-01', testVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena'] }]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena', testVoterName] }]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect(200);
  });

  it('should respond with a vote status of the voted event when making a valid vote to an event with two dates without any votes', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';
    const testVoteDate = '2014-01-12';
    const testVoteDates = ['2014-01-01', testVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: [] }]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: [testVoterName] }]);
    const responseEvent = createEventWithVotes({ id: testEventId }, [{ date: testVoteDate, people: [testVoterName] }]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(responseEvent);
      });
  });

  it('should respond with a vote status of the voted event when making a valid vote to an event with two dates, and to a date with votes', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';
    const testVoteDate = '2014-01-12';
    const testVoteDates = ['2014-01-01', testVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena'] }]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena', testVoterName] }]);
    const responseEvent = createEventWithVotes({ id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena', testVoterName] }]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(responseEvent);
      });
  });

  it('should respond with a vote status of the voted event when making a valid vote to an event with two voted dates, and to a date without any votes', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';

    const voteDate1 = '2014-01-01';
    const voteDate2 = '2014-01-12';
    const testVoteDates = [voteDate1, voteDate2];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [
      { date: voteDate1, people: [] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [
      { date: voteDate1, people: [testVoterName] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);
    const responseEvent = createEventWithVotes({ id: testEventId }, [
      { date: voteDate1, people: [testVoterName] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [voteDate1] })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(responseEvent);
      });
  });

  it('should respond with a vote status of the voted event when making a valid vote to an event with two voted dates, and to one of those dates', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';

    const voteDate1 = '2014-01-01';
    const voteDate2 = '2014-01-12';
    const testVoteDates = [voteDate1, voteDate2];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [
      { date: voteDate1, people: ['Sakke'] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [
      { date: voteDate1, people: ['Sakke', testVoterName] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);
    const responseEvent = createEventWithVotes({ id: testEventId }, [
      { date: voteDate1, people: ['Sakke', testVoterName] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [voteDate1] })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(responseEvent);
      });
  });

  it('should respond with a 404 when voting with event id which is not found', () => {
    const testEventId = 2234234;
    const testVoterName = 'Mikko';
    const testVoteDate = '2014-01-01';

    // DB stub returns an event
    stubForGetOneById.resolves(null);
    stubForUpdate.resolves(errors.RESOURCE_NOT_FOUND_ERROR);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect(404);
  });

  it('should respond with an error message when voting with event id which is not found', () => {
    const testEventId = 2234234;
    const testVoterName = 'Mikko';
    const testVoteDate = '2014-01-01';

    // DB stub returns an event
    stubForGetOneById.resolves(null);
    stubForUpdate.resolves(errors.RESOURCE_NOT_FOUND_ERROR);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).to.deep.equal(commonMessages.RESOURCE_NOT_FOUND);
      });
  });

  it('should respond with a 404 when voting with a non-existing date', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';

    const actualVoteDate = '2014-01-01';
    const testVoteDate = '2014-01-02';
    const testVoteDates = [actualVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: actualVoteDate, people: ['Sakke'] }
    ]);
    const testVoterName = 'Mikko';

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(errors.NONEXISTENT_DATES_ERROR);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect(404);
  });

  it('should respond with an error message when voting with a non-existing date', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';

    const actualVoteDate = '2014-01-01';
    const testVoteDate = '2014-01-02';
    const testVoteDates = [actualVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: actualVoteDate, people: ['Sakke'] }]);
    const testVoterName = 'Mikko';

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(errors.NONEXISTENT_DATES_ERROR);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).to.deep.equal(eventMessages.NONEXISTENT_DATES);
      });
  });

  it('should respond with an error message when voting without a name property', () => {
    const testEventId = 2;
    const testVoteDate = '2014-01-02';

    return request
      .post('/' + testEventId + '/vote')
      .send({ votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(commonMessages.INVALID_REQUEST_BODY);
      });
  });

  it('should respond with an error message when voting without a votes property', () => {
    const testEventId = 2;
    const testVoterName = '';

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(commonMessages.INVALID_REQUEST_BODY);
      });
  });

  it('should respond with an error message when voting with an empty name property', () => {
    const testEventId = 2;
    const testVoterName = '';
    const testVoteDate = '2014-01-02';

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(commonMessages.INVALID_REQUEST_BODY);
      });
  });

  it('should respond with an error message when voting with an empty votes property (array)', () => {
    const testEventId = 2;
    const testVoterName = 'Kalle';
    const testVoteDates = [];

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: testVoteDates })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(commonMessages.INVALID_REQUEST_BODY);
      });
  });

  it('should respond with an error message when voting with an array-typed name property', () => {
    const testEventId = 2;
    const testVoterName = ['test name'];
    const testVoteDate = '2014-01-02';

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(commonMessages.INVALID_REQUEST_BODY);
      });
  });

  it('should respond with an error message when voting with a string-typed votes property', () => {
    const testEventId = 2;
    const testVoterName = 'Kalle';
    const testVoteDate = '2014-01-02';

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: testVoteDate })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(commonMessages.INVALID_REQUEST_BODY);
      });
  });

  it('should respond with an error message when voting with a object-typed votes property', () => {
    const testEventId = 2;
    const testVoterName = 'Kalle';
    const testVoteDate = { date: '2014-01-02' };

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: testVoteDate })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(commonMessages.INVALID_REQUEST_BODY);
      });
  });
});
