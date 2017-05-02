const expect = require('chai').expect;
const sendServerErrorResponse = require('../util/helpers').sendServerErrorResponse;
const INVALID_REQUEST_URL = require('../common/messages').INVALID_REQUEST_URL;

describe('helper sendServerErrorResponse', () => {
  let response;
  beforeEach(() => {
    response = {
      statusCode: '',
      body: '',
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(text) {
        this.body = text;
        return this;
      },
      sendStatus(code) {
        this.statusCode = code;
        return this;
      },
    };
  });

  it('should modify response object to have status code 400 when calling sendServerErrorResponse with err.name === CastError and err.path === _id', () => {
    const error = { name: 'CastError', path: '_id' };
    sendServerErrorResponse(error, response);
    expect(response.statusCode).to.deep.equal(400);
  });

  it('should modify response object to have body with message \'Invalid request body\' when calling sendServerErrorResponse with err.name === CastError and err.path === _id',
    () => {
      const error = { name: 'CastError', path: '_id' };
      sendServerErrorResponse(error, response);
      expect(response.body).to.deep.equal(INVALID_REQUEST_URL);
    });

  it('should modify response object to have status code 500 when calling sendServerErrorResponse with err.name === CastError and err.path !== _id', () => {
    const error = { name: 'CastError', path: 'somethingelse' };
    sendServerErrorResponse(error, response);
    expect(response.statusCode).to.deep.equal(500);
  });
  it('should modify response object to have status code 500 when calling sendServerErrorResponse with err.name !== CastError and err.path === _id', () => {
    const error = { name: 'SomeOtherError', path: '_id' };
    sendServerErrorResponse(error, response);
    expect(response.statusCode).to.deep.equal(500);
  });
  it('should modify response object to have status code 500 when calling sendServerErrorResponse with err.name !== CastError and err.path !== _id', () => {
    const error = { name: 'SomeOtherError', path: 'somethingelse' };
    sendServerErrorResponse(error, response);
    expect(response.statusCode).to.deep.equal(500);
  });
});
