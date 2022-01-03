const Joi = require('joi');
const infoSite = require('../../data/sites/info.json');
const onairSite = require('../../data/sites/onair.json');
const resourceSite = require('../../data/sites/resource.json');

const allSite = { ...infoSite, ...onairSite, ...resourceSite };

const validLang = ['ja', 'en', 'zh-Hans', 'zh-Hant'];
const titleTranslateKeySchema = {};
validLang.forEach((lang) => {
    titleTranslateKeySchema[lang] = Joi.array().items(Joi.string().trim().required());
});

const validType = ['tv', 'web', 'movie', 'ova'];

const ISOJoi = Joi.extend((joi) => {
    return {
        base: joi.string(),
        name: 'string',
        language: {
            isoString: 'needs to be same as that after `.toISOString()`',
            isoRangeDateInvalid: 'date is invalid',
            isoRangeFormatInvalid: 'format is incorrect, interval only supports D and M'
        },
        rules: [
            {
                name: 'isoString',
                validate(params, value, state, options) {
                    let valid = true;
                    try {
                        valid = value === new Date(value).toISOString();
                    } catch (err) {
                        valid = false;
                    }
                    return valid
                        ? value
                        : this.createError('string.isoString', { v: value }, state, options);
                }
            },
            {
                name: 'isoRangeString',
                validate(params, value, state, options) {
                    if (!/R\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z\/P\d{1,2}[DM]/.test(value)) {
                        return this.createError('string.isoRangeFormatInvalid', { v: value }, state, options);
                    }

                    let valid = true;
                    const dateValue = value.split('/')[1];
                    try {
                        valid = dateValue === new Date(dateValue).toISOString();
                    } catch (err) {
                        valid = false;
                    }

                    return valid
                        ? value
                        : this.createError('string.isoRangeDateInvalid', { v: value }, state, options);
                }
            }
        ]
    };
});

module.exports = Joi.object().keys({
    title: Joi.string().trim().required(),
    titleTranslate: Joi.object().keys(titleTranslateKeySchema).required(),
    type: Joi.string().valid(validType).required(),
    lang: Joi.string().valid(validLang).required(),
    officialSite: Joi.string().uri().required().allow(''),
    begin: ISOJoi.string().isoString().required().allow(''),
    broadcast: ISOJoi.string().isoRangeString().allow(''),
    end: ISOJoi.string().isoString().required().allow(''),
    comment: Joi.string().trim().allow(''),
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
                begin: ISOJoi.string().isoString().required().allow(''),
                broadcast: ISOJoi.string().isoRangeString().allow(''),
                comment: Joi.string().trim().allow('')
            })
        }))
});
