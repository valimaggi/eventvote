const sinon = require('sinon');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const initRequest = require('./util/test-helpers').initRequest;
const messages = require('../common/messages');
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing


const createEventRouter = require('../routes/event-routes');

describe('POST /event', () => {
  let createEventRouterRequest;
  let stubForCreate;
  let request;

  before(() => {
    createEventRouterRequest = initRequest(createEventRouter, bodyParser.json());
    stubForCreate = sinon.stub();
    request = createEventRouterRequest('../../features/event-feature', {
      '../models/event': {
        create: stubForCreate
      }
    });
  });

  it('should respond with a 201 when posting a valid event', () => {
    const newId = 2;
    const testName = 'test name';
    const testDates = ['2016-01-01', '2016-01-20'];
    // DB stub returns an event with an _id
    stubForCreate.resolves(
      {
        _id: newId
      }
    );
    return request
      .post('/')
      .send({ name: testName, dates: testDates })
      .expect(201);
  });

  it('should respond with a new event id when posting a valid event', () => {
    const newId = 2;
    const testName = 'test name';
    const testDates = ['2016-01-01', '2016-01-20'];
    // DB stub returns an event with an _id
    stubForCreate.resolves(
      {
        _id: newId
      }
    );
    return request
      .post('/')
      .send({ name: testName, dates: testDates })
      .expect('Content-Type', /json/)
      .expect(201)
      .then((res) => {
        expect(res.body).to.deep.equal({ id: newId });
      });
  });

  it('should respond with a 400 when posting invalid event', () => {
    request
      .post('/')
      .send()
      .expect(400);
  });

  it('should respond with an error message when posting invalid event', () => {
    request
      .post('/')
      .send()
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.INVALID_REQUEST_BODY);
      });
  });
});
