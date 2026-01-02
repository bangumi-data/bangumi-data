const Joi = require('joi');
const infoSite = require('../../data/sites/info.json');
const onairSite = require('../../data/sites/onair.json');
const resourceSite = require('../../data/sites/resource.json');

const allSite = { ...infoSite, ...onairSite, ...resourceSite };

const validLang = ['ja', 'en', 'zh-Hans', 'zh-Hant'];
const titleTranslateKeySchema = {};
validLang.forEach((lang) => {
  titleTranslateKeySchema[lang] = Joi.array().items(
    Joi.string().trim().required()
  );
});

const validType = ['tv', 'web', 'movie', 'ova'];

// Custom Joi validators for ISO string and ISO range string
const isoStringValidator = (value, helpers) => {
  let valid = true;
  try {
    valid = value === new Date(value).toISOString();
  } catch {
    valid = false;
  }
  if (!valid) {
    return helpers.error('any.invalid', {
      message: 'needs to be same as that after `.toISOString()`',
    });
  }
  return value;
};

const isoRangeStringValidator = (value, helpers) => {
  if (
    !/R\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z\/P\d{1,2}[DM]/.test(
      value
    )
  ) {
    return helpers.error('any.invalid', {
      message: 'format is incorrect, interval only supports D and M',
    });
  }
  let valid = true;
  const dateValue = value.split('/')[1];
  try {
    valid = dateValue === new Date(dateValue).toISOString();
  } catch {
    valid = false;
  }
  if (!valid) {
    return helpers.error('any.invalid', { message: 'date is invalid' });
  }
  return value;
};

module.exports = Joi.object({
  title: Joi.string().trim().required(),
  titleTranslate: Joi.object(titleTranslateKeySchema).required(),
  type: Joi.string()
    .valid(...validType)
    .required(),
  lang: Joi.string()
    .valid(...validLang)
    .required(),
  officialSite: Joi.string().uri().required().allow(''),
  begin: Joi.string().custom(isoStringValidator).required().allow(''),
  broadcast: Joi.string().custom(isoRangeStringValidator).allow(''),
  end: Joi.string().custom(isoStringValidator).required().allow(''),
  comment: Joi.string().trim().allow(''),
  sites: Joi.array().items(
    Joi.object({
      site: Joi.string().valid(...Object.keys(allSite)),
      id: Joi.string().trim().when('url', {
        is: Joi.forbidden(),
        then: Joi.required(),
      }),
      url: Joi.string().uri(),
    }).when(
      Joi.object({ site: Joi.valid(...Object.keys(onairSite)) }).unknown(),
      {
        then: Joi.object({
          begin: Joi.string().custom(isoStringValidator).required().allow(''),
          broadcast: Joi.string().custom(isoRangeStringValidator).allow(''),
          comment: Joi.string().trim().allow(''),
        }),
      }
    )
  ),
});
