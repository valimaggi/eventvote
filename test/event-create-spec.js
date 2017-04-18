const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;
const bodyParser = require('body-parser');
const messages = require('../common/messages');
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const express = require('express');
const eventRoutes = require('../routes/event-routes');

describe('POST /event', () => {
  let request;
  let createEventStub;

  beforeEach(() => {
    const app = express();
    app.use(bodyParser.json());

    const mainRouter = new express.Router();
    app.use(mainRouter);

    createEventStub = sinon.stub();

    // Event feature module with stubbed event model dependency so we don't need DB to test.
    // Proxyquire enables stubbing the modules of the required module, in this case
    // the event model and its method create
    const feature = proxyquire('../features/event-feature', {
      '../models/event': {
        create: createEventStub
      }
    });
    // Bind event routes to main router
    eventRoutes(mainRouter, feature);
    // Get a supertest instance so we can make requests
    request = supertest(app);
  });

  it('should respond with a 201 when posting a valid event', () => {
    const newId = 2;
    const testName = 'test name';
    const testDates = ['2016-01-01', '2016-01-20'];
    // DB stub returns an event with an _id
    createEventStub.resolves(
      {
        _id: newId
      }
    );
    return request
      .post('/event')
      .send({ name: testName, dates: testDates })
      .expect(201);
  });

  it('should respond with a new event id when posting a valid event', () => {
    const newId = 2;
    const testName = 'test name';
    const testDates = ['2016-01-01', '2016-01-20'];
    // DB stub returns an event with an _id
    createEventStub.resolves(
      {
        _id: newId
      }
    );
    return request
      .post('/event')
      .send({ name: testName, dates: testDates })
      .expect(201)
      .then((res) => {
        expect(res.body).to.deep.equal({ id: newId });
      });
  });

  it('should respond with a 400 when posting invalid event', () => {
    request
      .post('/event')
      .send()
      .expect(400);
  });

  it('should respond with an error message when posting invalid event', () => {
    request
      .post('/event')
      .send()
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.INVALID_REQUEST_BODY);
      });
  });
});
