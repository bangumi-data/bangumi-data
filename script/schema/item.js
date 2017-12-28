const Joi = require('joi');
const infoSite = require('../../data/sites/info.json');
const onairSite = require('../../data/sites/onair.json');
const resourceSite = require('../../data/sites/resource.json');

const allSite = Object.assign({}, infoSite, onairSite, resourceSite);

const validLang = ['ja', 'en', 'zh-Hans', 'zh-Hant'];
const titleTranslateKeySchema = {};
validLang.forEach((lang) => {
    titleTranslateKeySchema[lang] = Joi.array().items(Joi.string().trim().required());
});

const validType = ['tv', 'web', 'movie', 'ova'];

module.exports = Joi.object().keys({
    title: Joi.string().trim().required(),
    titleTranslate: Joi.object().keys(titleTranslateKeySchema).required(),
    type: Joi.string().valid(validType).required(),
    lang: Joi.string().valid(validLang).required(),
    officialSite: Joi.string().uri().required().allow(''),
    begin: Joi.string().isoDate().required().allow(''),
    end: Joi.string().isoDate().required().allow(''),
    comment: Joi.string().required().trim().allow(''),
    sites: Joi.array().items(Joi.object()
        .keys({
            site: Joi.string().valid(Object.keys(allSite)),
            id: Joi.string().trim().when('url', {
                is: Joi.forbidden(),
                then: Joi.required()
            }),
            url: Joi.string().uri()
        })
        .when(Joi.object().keys({ site: Joi.valid(Object.keys(onairSite)) }).unknown(), {
            then: Joi.object().keys({
                begin: Joi.string().isoDate().required().allow(''),
                official: Joi.boolean().required().allow(null),
                premuiumOnly: Joi.boolean().required().allow(null),
                censored: Joi.boolean().required().allow(null),
                exist: Joi.boolean().required().allow(null),
                comment: Joi.string().trim().required().allow('')
            })
        }))
});
