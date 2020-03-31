const path = require('path');
const fs = require('fs-extra');
const Joi = require('joi');
const { readJsonPaths } = require('./utils');
const siteSchema = require('./schema/site');
const itemSchema = require('./schema/item');

const ITEMS_DIRECTORY = 'data/items/';
const SITES_DIRECTORY = 'data/sites/';
const IGNORE_PATH_REGEXP = /0000\//;

const validateItems = readJsonPaths(ITEMS_DIRECTORY, IGNORE_PATH_REGEXP)
    .then((itemPaths) => {
        // 同步读取所有json文件
        itemPaths.forEach((itemPath) => {
            if (!(/0[1-9]|1[0-2]\.json$/.test(itemPath))) {
                throw new Error(`Invalid file name: ${itemPath}`);
            }

            const dataArray = fs.readJsonSync(itemPath);

            dataArray.forEach((itemData) => {
                Joi.validate(itemData, itemSchema, (error) => {
                    if (error) {
                        throw error;
                    }
                });
            });
        });
    });

const validateSites = readJsonPaths(SITES_DIRECTORY)
    .then((sitePaths) => {
        // 同步读取所有json文件
        sitePaths.forEach((sitePath) => {
            const siteData = fs.readJsonSync(sitePath);

            Object.keys(siteData).forEach((key) => {
                Joi.validate(siteData[key], siteSchema, (error) => {
                    if (error) {
                        throw error;
                    }
                });
            });
        });
    });

// 验证 Bangumi ID 是唯一的
const validateUniqueBangumiId = readJsonPaths(ITEMS_DIRECTORY, IGNORE_PATH_REGEXP)
    .then((itemPaths) => {
        const idMap = Object.create(null);
        itemPaths.forEach((itemPath) => {
            const dataArray = fs.readJsonSync(itemPath);
            dataArray.forEach((itemData) => {
                const { id } = (itemData.sites.find((site) => {
                    return site.site === 'bangumi';
                }) || {});
                if (!id) {
                    return;
                }
                const key = `${itemData.lang}_${id}`;
                if (idMap[key]) {
                    const paths = [
                        path.relative(ITEMS_DIRECTORY, idMap[key]),
                        path.relative(ITEMS_DIRECTORY, itemPath)
                    ];
                    throw new Error(`Bangumi ID ${id} is duplicated in ${paths.join(' and ')}`);
                }
                idMap[key] = itemPath;
            });
        });
    });

const validateUniqueSiteInSites = readJsonPaths(ITEMS_DIRECTORY, IGNORE_PATH_REGEXP)
    .then((itemPaths) => {
        itemPaths.forEach((itemPath) => {
            const dataArray = fs.readJsonSync(itemPath);
            dataArray.forEach((itemData) => {
                const siteNames = itemData.sites.map(({ site }) => { return site; });
                if ([...new Set(siteNames)].length !== siteNames.length) {
                    throw new Error(`Sites of ${itemData.title} is not unique in ${itemPath}`);
                }
            });
        });
    });

Promise.all([
    validateItems,
    validateSites,
    validateUniqueBangumiId,
    validateUniqueSiteInSites
])
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
