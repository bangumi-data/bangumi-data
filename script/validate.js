const fs = require('fs-extra');
const { readJsonPaths } = require('./utils');
const Validator = require('./Validator');

const ITEMS_DIRECTORY = 'data/items/';
const SITES_DIRECTORY = 'data/sites/';

/** @type {Object} 验证器 */
const validator = new Validator();

readJsonPaths(ITEMS_DIRECTORY)
    .then((itemPaths) => {
        // 同步读取所有json文件
        itemPaths.forEach((itemPath) => {
            const idPrefix = itemPath.match(/\d{2}\/\d{2}/)[0].replace(/\//g, '_');
            const dataArray = fs.readJsonSync(itemPath);

            dataArray.forEach((singleData, index) => {
                // example => 16_06_0
                const id = `${idPrefix}_${index}`;
                // 验证
                const errors = validator.validateItemData(singleData);

                if (errors.length) {
                    throw new Error(`Failed item: ${id}, errors: ${errors.join(', ')}`);
                }
            });
        });
    })
    .catch((error) => {
        console.error(error);
    });

readJsonPaths(SITES_DIRECTORY)
    .then((sitePaths) => {
        // 同步读取所有json文件
        sitePaths.forEach((itemPath) => {
            const siteData = fs.readJsonSync(itemPath);

            Object.keys(siteData).forEach((key) => {
                // 验证
                const errors = validator.validateSiteMeta(siteData[key]);

                if (errors.length) {
                    throw new Error(`Failed site: ${key}, errors: ${errors.join(', ')}`);
                }
            });
        });
    })
    .catch((error) => {
        console.error(error);
    });
