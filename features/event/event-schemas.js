const Joi = require('joi');

const create = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    dates: Joi.array().min(1).items(Joi.date()).required()
  })
};

const castVote = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    votes: Joi.array().min(1).items(Joi.date()).required()
  })
};

module.exports = { create, castVote };
