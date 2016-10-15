const fs = require('fs-extra');
const { readJsonPaths } = require('./utils');
const Joi = require('joi');
const siteSchema = require('./schema/site');
const itemSchema = require('./schema/item');

const ITEMS_DIRECTORY = 'data/items/';
const SITES_DIRECTORY = 'data/sites/';

readJsonPaths(ITEMS_DIRECTORY)
    .then((itemPaths) => {
        // 同步读取所有json文件
        itemPaths.forEach((itemPath) => {
            // const idPrefix = itemPath.match(/\d{4}(?:\/|\\)\d{2}/)[0].replace(/\/|\\/g, '_');
            const dataArray = fs.readJsonSync(itemPath);

            dataArray.forEach((itemData, index) => {
                // example => 2016_06_0
                // const id = `${idPrefix}_${index}`;

                Joi.validate(itemData, itemSchema, (error) => {
                    if (error) {
                        throw error;
                    }
                });
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
                Joi.validate(siteData[key], siteSchema, (error) => {
                    if (error) {
                        throw error;
                    }
                });
            });
        });
    })
    .catch((error) => {
        console.error(error);
    });
