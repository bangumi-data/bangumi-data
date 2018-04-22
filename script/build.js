const path = require('path');
const fs = require('fs-extra');
const { readJsonPaths } = require('./utils');
const Joi = require('joi');
const siteSchema = require('./schema/site');
const itemSchema = require('./schema/item');

const ITEMS_DIRECTORY = 'data/items/';
const SITES_DIRECTORY = 'data/sites/';
const DIST_PATH = 'dist/';

/** @type {Array} 保存所有番组数据 */
const itemsData = [];
/** @type {Object} 保存所有站点元数据 */
let sitesData = {};

const task = [
    {
        target: 'data.json',
        transform: (list) => {
            return list.reduce((prev, curr) => {
                return prev.concat(curr.data);
            }, []);
        }
    },
    {
        target: 'latest.json',
        transform: (list) => {
            return list.slice(-6).reduce((prev, curr) => {
                return prev.concat(curr.data);
            }, []);
        }
    }
    // another example
    // {
    //     target: 'still_playing.json',
    //     transform: (list) => {
    //         return list
    //             .reduce((prev, curr) => {
    //                 return prev.concat(curr.data);
    //             }, [])
    //             .filter((value) => {
    //                 // 没有结束时间,仍然在放送中
    //                 return value.end === '';
    //             });
    //     }
    // }
];

readJsonPaths(ITEMS_DIRECTORY)
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
        /** @type {Array<{path: string, data: Array}>} path-data mapper  */
        const pathAndDataList = itemPaths.map((itemPath) => {
            let dataArray = fs.readJsonSync(itemPath);

            dataArray = dataArray.map((itemData) => {
                const result = Joi.validate(itemData, itemSchema);

                if (result.error) {
                    throw result.error;
                }

                return itemData;
            });

            return { path: itemPath, data: dataArray };
        });

        task.forEach((t) => {
            itemsData.push({
                target: t.target,
                content: t.transform(pathAndDataList)
            });
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
                const result = Joi.validate(siteData[key], siteSchema);

                if (result.error) {
                    throw result.error;
                }

                // 为每一条站点元数据增加'type'字段
                siteData[key].type = type;
            });

            sitesData = Object.assign({}, sitesData, siteData);
        });

        return Promise.resolve(sitesData);
    })
    .then(() => {
        fs.emptyDir(DIST_PATH, (error) => {
            if (error) {
                console.error(error);
            }

            itemsData.forEach((it) => {
                fs.writeJson(
                    path.resolve(DIST_PATH, it.target),
                    {
                        siteMeta: sitesData,
                        items: it.content
                    },
                    (err) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log(`${it.target}: done`);
                        }
                    }
                );
            });
        });
    })
    .catch((error) => {
        console.error(error);
    });
