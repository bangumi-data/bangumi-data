const _ = require('lodash');

const validateFunc = {
    required(value) {
        return !_.isUndefined(value);
    },
    isString(value) {
        return _.isString(value);
    },
    isObject(value) {
        return _.isPlainObject(value);
    },
    isURL(value) {
        const URL_REGEXP = /^https?:\/\/.+$/;
        return URL_REGEXP.test(value);
    },
    isDate(value) {
        const DATE_REGEXP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        return DATE_REGEXP.test(value);
    },
    isArray(value) {
        return _.isArray(value);
    },
    isBoolean(value) {
        return _.isBoolean(value);
    }
};

class Validator {
    /**
     * 验证数据对象
     * @param {Object} data 数据对象
     * @param {Array} schemes 规则数组
     */
    validate(data, schemes) {
        let errors = [];

        Object.keys(schemes).forEach((key) => {
            const rules = schemes[key];
            const value = data[key];

            // 如果没有required，则允许该key不存在
            if (rules.indexOf('required') === -1 && typeof value === 'undefined') {
                return;
            }

            rules.forEach((rule) => {
                if (_.isString(rule)) {
                    if (!validateFunc[rule].call(null, value)) {
                        errors.push(`'${key}' should pass '${rule}'`);
                    }
                } else if (_.isArray(rule)) {
                    const template = rule[0];
                    value.forEach((singleValue) => {
                        errors = [...errors, ...this.validate(singleValue, template)];
                    });
                } else if (_.isPlainObject(rule)) {
                    const template = rule;
                    errors = [...errors, ...this.validate(value, template)];
                }
            });
        });

        return errors;
    }

    /**
     * 验证单条番组数据
     * @param {Object} data 单条数据
     */
    validateItemData(data) {
        const rules = {
            title: ['required', 'isString'],
            titleTranslate: ['required', 'isObject', {
                'en-US': ['isArray'],
                'zh-Hans': ['isArray'],
                'zh-Hant': ['isArray']
            }],
            lang: ['required', 'isString'],
            officialSite: ['required', 'isURL'],
            begin: ['required', 'isDate'],
            end: ['required', 'isDate'],
            comment: ['required', 'isString'],
            sites: ['required', 'isArray', [
                {
                    site: ['required', 'isString'],
                    official: ['isBoolean'],
                    premuiumOnly: ['isBoolean'],
                    censored: ['isBoolean'],
                    lang: ['isString'],
                    comment: ['isString'],
                    begin: ['isDate']
                }
            ]]
        };

        return this.validate(data, rules);
    }

    /**
     * 验证单条站点元数据
     * @param {Object} data 单条数据
     */
    validateSiteMeta(data) {
        const rules = {
            title: ['required', 'isString'],
            urlTemplate: ['isURL']
        };

        return this.validate(data, rules);
    }
}

module.exports = Validator;
