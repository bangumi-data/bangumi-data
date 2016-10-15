const Joi = require('joi');

module.exports = Joi.object().keys({
    title: Joi.string().trim().required(),
    urlTemplate: Joi.string().regex(/^https?:\/\/.+$/).trim()
});
