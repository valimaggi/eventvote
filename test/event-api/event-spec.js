const sinon = require('sinon');
const expect = require('chai').expect;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const initRequest = require('../test-helpers').initRequest;
const createEventRouter = require('../../features/event/event-routes');
const { createInvalidIdErrorObject } = require('./utils');
const messages = require('../../common/messages');

describe('GET /event/:id', () => {
  let createEventRouterRequest;
  let stubForGetOneById;
  let request;

  before(() => {
    createEventRouterRequest = initRequest();
    stubForGetOneById = sinon.stub();
    request = createEventRouterRequest(createEventRouter, '../features/event/event-feature', {
      './event-model': {
        getOneById: stubForGetOneById
      }
    });
  });

  it('should respond with a 200 when using valid id', () => {
    const testId = 3;
    stubForGetOneById.resolves(
      {
        _id: testId,
        name: 'Mikko\'s awesome party',
        dates: ['2014-01-01'],
        votes: []
      }
    );
    return request
      .get('/' + testId)
      .expect(200);
  });

  it('should respond with one event when using valid id', () => {
    const testId = 2;
    // DB stub returns an event
    stubForGetOneById.resolves(
      {
        _id: testId,
        name: 'Mikko\'s awesome party',
        dates: ['2014-01-01', '2014-01-05', '2014-01-12'],
        votes: [
          {
            date: '2014-01-01',
            people: ['Mikko', 'Heidi', 'Tyrsky']
          }
        ]
      }
    );
    return request
      .get('/' + testId)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(
          {
            id: testId,
            name: 'Mikko\'s awesome party',
            dates: ['2014-01-01', '2014-01-05', '2014-01-12'],
            votes: [
              {
                date: '2014-01-01',
                people: ['Mikko', 'Heidi', 'Tyrsky']
              }
            ]
          }
        );
      });
  });

  it('should respond with a 404 when using valid but non-existing id', () => {
    const nonExistingId = '57fa90d046d78827c7c50f83';
    // DB stub returns null
    stubForGetOneById.resolves(null);
    return request
      .get('/' + nonExistingId)
      .expect(404);
  });

  it('should respond with a not found message when using valid but non-existing id', () => {
    const nonExistingId = '57fa90d046d78827c7c50f83';
    // DB stub returns null
    stubForGetOneById.resolves(null);
    return request
      .get('/' + nonExistingId)
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.RESOURCE_NOT_FOUND);
      });
  });

  it('should respond with a 400 when using invalid id', () => {
    const invalidId = '57fa90d046d78827c7c50f8';
    const errorObject = createInvalidIdErrorObject(invalidId);
    // DB stub returns null
    stubForGetOneById.rejects(errorObject);
    return request
      .get('/' + invalidId)
      .expect(400);
  });

  it('should respond with an error message when using invalid id', () => {
    const invalidId = '57fa90d046d78827c7c50f8';
    const errorObject = createInvalidIdErrorObject(invalidId);
    // DB stub returns null
    stubForGetOneById.rejects(errorObject);
    return request
      .get('/' + invalidId)
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.INVALID_REQUEST_URL);
      });
  });

  it('should respond with a 500 in other cases when errors occur in server', () => {
    const errorObject = {
      name: 'not CastError'
    };
    // DB stub returns error
    stubForGetOneById.rejects(errorObject);
    return request
      .get('/234gd')
      .expect(500);
  });
});
