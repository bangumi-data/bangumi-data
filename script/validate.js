const path = require('path');
const fs = require('fs-extra');
const { readJsonPaths } = require('./utils');
const Joi = require('joi');
const siteSchema = require('./schema/site');
const itemSchema = require('./schema/item');

const ITEMS_DIRECTORY = 'data/items/';
const SITES_DIRECTORY = 'data/sites/';

const validateItems = readJsonPaths(ITEMS_DIRECTORY)
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
const validateUniqueBangumiId = readJsonPaths(ITEMS_DIRECTORY)
    .then((itemPaths) => {
        const idMap = Object.create(null);
        itemPaths.forEach((itemPath) => {
            const dataArray = fs.readJsonSync(itemPath);
            dataArray.forEach((itemData) => {
                const id = (itemData.sites.find((site) => {
                    return site.site === 'bangumi';
                }) || {}).id;
                if (!id) {
                    return;
                }
                if (idMap[id]) {
                    const paths = [
                        path.relative(ITEMS_DIRECTORY, idMap[id]),
                        path.relative(ITEMS_DIRECTORY, itemPath)
                    ];
                    throw new Error(`Bangumi ID ${id} is duplicated in ${paths.join(' and ')}`);
                }
                idMap[id] = itemPath;
            });
        });
    });

const validateDate = readJsonPaths(ITEMS_DIRECTORY)
    .then((itemPaths) => {
        itemPaths.forEach((itemPath) => {
            const { dir, name } = path.parse(path.relative(ITEMS_DIRECTORY, itemPath));
            const date = `${dir}-${name}`;

            const dataArray = fs.readJsonSync(itemPath);
            dataArray.forEach((itemData) => {
                if (date !== itemData.begin.slice(0, 7)) {
                    throw new Error(`${itemData.title} (${itemData.begin}) should not be in ${dir}/${name}.json`);
                }
                if (!itemData.end) {
                    const delta = new Date().toISOString().slice(0, 7).replace(/-/, '') - `${dir}${name}`;
                    if (delta > 6) {
                        console.warn(`[warn] ${itemData.title} in ${dir}/${name}.json lacks "end" field more than 6 months!`);
                    } else if (delta > 3) {
                        console.info(`[info] ${itemData.title} in ${dir}/${name}.json lacks "end" field more than 3 months.`);
                    }
                }
            });
        });
    });

Promise.all([validateItems, validateSites, validateUniqueBangumiId, validateDate])
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
