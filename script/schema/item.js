const Joi = require('joi');

const validLang = ['ja', 'en', 'zh-Hans', 'zh-Hant'];
const titleTranslateKeySchema = {};

validLang.forEach((lang) => {
    titleTranslateKeySchema[lang] = Joi.array().items(Joi.string().trim().required());
});

module.exports = Joi.object().keys({
    title: Joi.string().trim().required(),
    titleTranslate: Joi.object().keys(titleTranslateKeySchema).required(),
    lang: Joi.string().valid(validLang),
    officialSite: Joi.string().uri().required().allow(''),
    begin: Joi.string().isoDate().required().allow(''),
    end: Joi.string().isoDate().required().allow(''),
    comment: Joi.string().required().trim().allow(''),
    sites: Joi.array().items(Joi.object().keys({
        site: Joi.string().trim().required(),
        id: Joi.string().trim(),
        keyword: Joi.string().trim(),
        url: Joi.string().regex(/^https?:\/\/.+$/).trim(),
        /** onair only begins */
        begin: Joi.string().isoDate().allow(''),
        official: Joi.boolean(),
        premuiumOnly: Joi.boolean(),
        censored: Joi.boolean(),
        lang: Joi.string().valid(validLang),
        comment: Joi.string().trim().allow('')
        /** onair only ends */
    }))
});
