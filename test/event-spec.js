const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;
const messages = require('../common/messages');
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const express = require('express');
const eventRoutes = require('../routes/event-routes');

describe('GET /event/:id', () => {
  let request;
  let getOneByIdStub;

  beforeEach(() => {
    const app = express();
    const mainRouter = new express.Router();
    app.use(mainRouter);

    getOneByIdStub = sinon.stub();

    // Event feature module with stubbed event model dependency so we don't need DB to test.
    // Proxyquire enables stubbing the modules of the required module, in this case
    // the event model and its method getOneByIdStub
    const feature = proxyquire('../features/event-feature', {
      '../models/event': {
        getOneById: getOneByIdStub
      }
    });
    // Bind event routes to main router
    eventRoutes(mainRouter, feature);
    // Get a supertest instance so we can make requests
    request = supertest(app);
  });
  it('should respond with a 200 when using valid id', () => {
    const testId = 3;
    getOneByIdStub.resolves(
      {
        _id: testId,
        name: 'Mikko\'s awesome party',
        dates: ['2014-01-01'],
        votes: []
      }
    );
    return request
      .get('/event/' + testId)
      .expect(200);
  });

  it('should respond with one event when using valid id', () => {
    const testId = 2;
    // DB stub returns an event
    getOneByIdStub.resolves(
      {
        _id: testId,
        name: 'Mikko\'s awesome party',
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: '2014-01-01',
            people: [
              'Mikko',
              'Heidi',
              'Tyrsky'
            ]
          }
        ]
      }
    );
    return request
      .get('/event/' + testId)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(
          {
            id: testId,
            name: 'Mikko\'s awesome party',
            dates: [
              '2014-01-01',
              '2014-01-05',
              '2014-01-12'
            ],
            votes: [
              {
                date: '2014-01-01',
                people: [
                  'Mikko',
                  'Heidi',
                  'Tyrsky'
                ]
              }
            ]
          }
        );
      });
  });

  it('should respond with a 404 when using non-existing id', () => {
    const nonExistingId = '57fa90d046d78827c7c50f83';
    // DB stub returns null
    getOneByIdStub.resolves(null);
    return request
      .get('/event/' + nonExistingId)
      .expect(404);
  });

  it('should respond with a not found message when using non-existing id', () => {
    const nonExistingId = '57fa90d046d78827c7c50f83';
    // DB stub returns null
    getOneByIdStub.resolves(null);
    return request
      .get('/event/' + nonExistingId)
      .expect(404)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.RESOURCE_NOT_FOUND);
      });
  });

  it('should respond with a 400 when using invalid id', () => {
    const invalidId = '57fa90d046d78827c7c50f8';
    const errorObject = {
      message: 'Cast to ObjectId failed for value ' + invalidId + ' at path \'_id\'',
      name: 'CastError',
      kind: 'ObjectId',
      value: invalidId,
      path: '_id'
    };
    // DB stub returns null
    getOneByIdStub.rejects(errorObject);
    return request
      .get('/event/' + invalidId)
      .expect(400);
  });

  it('should respond with an error message when using invalid id', () => {
    const invalidId = '57fa90d046d78827c7c50f8';
    const errorObject = {
      message: 'Cast to ObjectId failed for value ' + invalidId + ' at path \'_id\'',
      name: 'CastError',
      kind: 'ObjectId',
      value: invalidId,
      path: '_id'
    };
    // DB stub returns null
    getOneByIdStub.rejects(errorObject);
    return request
      .get('/event/' + invalidId)
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
    getOneByIdStub.rejects(errorObject);
    return request
      .get('/event/234gd')
      .expect(500);
  });
});
