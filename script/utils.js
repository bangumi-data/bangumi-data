const fs = require('fs-extra');

/**
 * 获取文件夹下所有通过正则匹配的文件路径
 * @param  {String} startPoint       起始路径
 * @param  {Regexp} [pattern=/.+/gi] 文件名正则
 * @return {Promise}
 */
const readFilePaths = (startPoint, pattern = /.+/gi) => {
    const filePaths = [];

    return new Promise((resolve, reject) => {
        fs.walk(startPoint)
        .on('data', (item) => {
            if (pattern.test(item.path)) {
                filePaths.push(item.path);
            }
        })
        .on('error', (error) => {
            reject(error);
        })
        .on('end', () => {
            resolve(filePaths);
        });
    });
};

/**
 * 获取文件夹下所有json文件的路径
 * @param  {String} startPoint 起始路径
 * @return {Promise}
 */
const readJsonPaths = (startPoint) => {
    return readFilePaths(startPoint, /\.json$/i);
};

module.exports = {
    readFilePaths,
    readJsonPaths
};
