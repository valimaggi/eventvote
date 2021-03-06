const sinon = require('sinon');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const { initRequest } = require('../test-helpers');
const createEventRouter = require('../../api/event-router');
const { INVALID_REQUEST_BODY } = require('../../common/messages');

describe('POST /event', () => {
  let createEventRouterRequest;
  let stubForCreate;
  let request;

  const validRequestBody = {
    name: 'test name',
    dates: ['2016-01-01', '2016-01-20']
  };

  before(() => {
    createEventRouterRequest = initRequest(bodyParser.json());
    stubForCreate = sinon.stub();
    request = createEventRouterRequest(createEventRouter, '../features/event/event-feature', {
      './event-model': {
        create: stubForCreate
      }
    });
  });

  it('should respond with a 201 when posting a valid event', () => {
    const newId = 2;
    // DB stub returns an event with an _id
    stubForCreate.resolves(
      {
        _id: newId
      }
    );
    return request
      .post('/')
      .send(validRequestBody)
      .expect(201);
  });

  it('should respond with a new event id when posting a valid event', () => {
    const newId = 2;
    // DB stub returns an event with an _id
    stubForCreate.resolves(
      {
        _id: newId
      }
    );
    return request
      .post('/')
      .send(validRequestBody)
      .expect('Content-Type', /json/)
      .expect(201)
      .then((res) => {
        expect(res.body).to.deep.equal({ id: newId });
      });
  });

  it('should respond with a 400 when posting an event without a dates property', () => {
    const testName = 'test name';
    return request
      .post('/')
      .send({ name: testName })
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('should respond with an error message when posting an event without a dates property', () => {
    const testName = 'test name';
    return request
      .post('/')
      .send({ name: testName })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(INVALID_REQUEST_BODY);
      });
  });

  it('should respond with a 400 message when posting an event without a name property', () => {
    const testDates = ['2016-12-01'];
    return request
      .post('/')
      .send({ dates: testDates })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(INVALID_REQUEST_BODY);
      });
  });

  it('should respond with a 400 message when posting an event with an array-typed name property', () => {
    const testName = ['test name'];
    const testDates = ['2016-12-01'];
    return request
      .post('/')
      .send({ name: testName, dates: testDates })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(INVALID_REQUEST_BODY);
      });
  });

  it('should respond with a 400 message when posting an event with a string-typed dates property', () => {
    const testName = 'test name';
    const testDates = '2016-12-01';
    return request
      .post('/')
      .send({ name: testName, dates: testDates })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(INVALID_REQUEST_BODY);
      });
  });

  it('should respond with a 400 message when posting an event with dates property array with (invalid) string values instead of dates', () => {
    const testName = 'test name';
    const testDates = ['invalid date'];
    return request
      .post('/')
      .send({ name: testName, dates: testDates })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(INVALID_REQUEST_BODY);
      });
  });

  it('should respond with a 400 message when posting an event with dates property array with (invalid) object values instead of dates', () => {
    const testName = 'test name';
    const testDates = [{}, {}];
    return request
      .post('/')
      .send({ name: testName, dates: testDates })
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(INVALID_REQUEST_BODY);
      });
  });

  it('should respond with a 500 in other cases when errors occur in server', () => {
    const errorObject = {
      name: 'not CastError'
    };
    // DB stub returns error
    stubForCreate.rejects(errorObject);
    return request
      .post('/')
      .send(validRequestBody)
      .expect(500);
  });
});
