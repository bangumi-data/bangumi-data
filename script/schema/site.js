const Joi = require('joi');

module.exports = Joi.object({
  title: Joi.string().trim().required(),
  urlTemplate: Joi.string()
    .pattern(/^https?:\/\/.+$/)
    .trim(),
  regions: Joi.array().items(Joi.string()),
});
