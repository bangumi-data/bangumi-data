const path = require('path');
const fs = require('fs-extra');
const { readJsonPaths } = require('./utils');
const siteSchema = require('./schema/site');
const itemSchema = require('./schema/item');

const ITEMS_DIRECTORY = 'data/items/';
const SITES_DIRECTORY = 'data/sites/';
const DIST_PATH = 'dist/';
const DIST_FILE_NAME = 'data.json';
const IGNORE_PATH_REGEXP = /0000\//;

/** @type {Array} 保存所有番组数据 */
let itemsData = [];
/** @type {Object} 保存所有站点元数据 */
let sitesData = {};

readJsonPaths(ITEMS_DIRECTORY, IGNORE_PATH_REGEXP)
  .then((itemPaths) => {
    // 根据年份和月份排序json文件
    itemPaths.sort((prev, next) => {
      const REGEXP = /(\d{4})(?:\/|\\)(\d{2})/;
      const [prevYear, prevMonth] = prev.match(REGEXP).slice(1);
      const [nextYear, nextMonth] = next.match(REGEXP).slice(1);

      if (+prevYear === +nextYear) {
        return +prevMonth - +nextMonth;
      }

      return +prevYear - +nextYear;
    });

    // 同步读取所有json文件
    itemPaths.forEach((itemPath) => {
      let dataArray = fs.readJsonSync(itemPath);

      dataArray = dataArray.map((itemData) => {
        const { error } = itemSchema.validate(itemData);

        if (error) {
          throw error;
        }

        return itemData;
      });

      itemsData = itemsData.concat(dataArray);
    });

    return Promise.resolve(itemsData);
  })
  .then(() => {
    return readJsonPaths(SITES_DIRECTORY);
  })
  .then((sitePaths) => {
    // 同步读取所有json文件
    sitePaths.forEach((itemPath) => {
      const REGEXP = /(\w+)\.json/i;
      const type = itemPath.match(REGEXP)[1];
      const siteData = fs.readJsonSync(itemPath);

      Object.keys(siteData).forEach((key) => {
        const { error } = siteSchema.validate(siteData[key]);

        if (error) {
          throw error;
        }

        // 为每一条站点元数据增加'type'字段
        siteData[key].type = type;
      });

      sitesData = { ...sitesData, ...siteData };
    });

    return Promise.resolve(sitesData);
  })
  .then(() => {
    fs.emptyDir(DIST_PATH, (error) => {
      if (error) {
        console.error(error);
      }

      fs.writeJson(
        path.resolve(DIST_PATH, DIST_FILE_NAME),
        {
          siteMeta: sitesData,
          items: itemsData,
        },
        (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('done');
          }
        }
      );
    });
  })
  .catch((error) => {
    console.error(error);
  });
