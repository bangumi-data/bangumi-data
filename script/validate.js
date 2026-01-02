const path = require('path');
const fs = require('fs-extra');
const Joi = require('joi');
const _ = require('lodash');
const { readJsonPaths } = require('./utils');
const siteSchema = require('./schema/site');
const itemSchema = require('./schema/item');

const ITEMS_DIRECTORY = 'data/items/';
const SITES_DIRECTORY = 'data/sites/';
const IGNORE_PATH_REGEXP = /0000\//;

const validateItems = readJsonPaths(ITEMS_DIRECTORY, IGNORE_PATH_REGEXP).then(
  (itemPaths) => {
    const errorList = [];
    // 同步读取所有json文件
    itemPaths.forEach((itemPath) => {
      if (!/0[1-9]|1[0-2]\.json$/.test(itemPath)) {
        errorList.push(new Error(`Invalid filename: ${itemPath}`));
        return;
      }

      const dataArray = fs.readJsonSync(itemPath);

      dataArray.forEach((itemData) => {
        Joi.validate(itemData, itemSchema, (error) => {
          if (error) {
            errorList.push(
              new Error(
                `[ITEM] ${path.relative(ITEMS_DIRECTORY, itemPath)} ${itemData.title}: ${error.message}`
              )
            );
          }
        });

        // validate end date if exist
        if (itemData.end && itemData.begin) {
          const endDate = new Date(itemData.end);
          const beginDate = new Date(itemData.begin);
          if (endDate < beginDate) {
            errorList.push(
              new Error(
                `[ITEM] ${path.relative(ITEMS_DIRECTORY, itemPath)} ${itemData.title}: End is earlier than begin`
              )
            );
          }
        }

        if (itemData.sites) {
          // sites in item must be unique
          const siteNames = itemData.sites.map(({ site }) => {
            return site;
          });
          if ([...new Set(siteNames)].length !== siteNames.length) {
            errorList.push(
              new Error(
                `[ITEM] ${path.relative(ITEMS_DIRECTORY, itemPath)} ${itemData.title}: Sites is not unique`
              )
            );
          }
        }
      });
    });

    return errorList;
  }
);

const validateSites = readJsonPaths(SITES_DIRECTORY).then((sitePaths) => {
  const errorList = [];

  // 同步读取所有json文件
  sitePaths.forEach((sitePath) => {
    const siteData = fs.readJsonSync(sitePath);

    Object.keys(siteData).forEach((key) => {
      Joi.validate(siteData[key], siteSchema, (error) => {
        if (error) {
          errorList.push(
            new Error(
              `[SITE] ${path.relative(SITES_DIRECTORY, sitePath)} ${key}: ${error.message}`
            )
          );
        }
      });
    });
  });

  return errorList;
});

// 验证 Bangumi ID 是唯一的
const validateUniqueBangumiId = readJsonPaths(
  ITEMS_DIRECTORY,
  IGNORE_PATH_REGEXP
).then((itemPaths) => {
  const errorList = [];
  const idMap = Object.create(null);
  itemPaths.forEach((itemPath) => {
    const dataArray = fs.readJsonSync(itemPath);
    dataArray.forEach((itemData) => {
      const { id } =
        itemData.sites.find((site) => {
          return site.site === 'bangumi';
        }) || {};
      if (!id) {
        return;
      }
      const key = `${itemData.lang}_${id}`;
      if (idMap[key]) {
        const paths = [
          path.relative(ITEMS_DIRECTORY, idMap[key]),
          path.relative(ITEMS_DIRECTORY, itemPath),
        ];
        errorList.push(
          new Error(
            `[DUPLICATE] Bangumi ID ${id} is duplicated in ${paths.join(' and ')}`
          )
        );
      }
      idMap[key] = itemPath;
    });
  });
  return errorList;
});

Promise.all([validateItems, validateSites, validateUniqueBangumiId])
  .then((...errorLists) => {
    const errorList = _.chain(errorLists).flattenDeep().compact().value();
    if (errorList.length) {
      console.log('--- Validation Error ---');
      errorList.forEach((error) => {
        console.error(error.message);
      });
      console.log('');
      process.exit(1);
    } else {
      console.log('Validation passed');
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
