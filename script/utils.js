const klaw = require('klaw');

/**
 * 获取文件夹下所有通过正则匹配的文件路径
 * @param  {String} startPoint       起始路径
 * @param  {Regexp} [pattern=/.+/gi] 文件名正则
 * @param  {Regexp} ignore 需要忽略的文件路径正则
 * @return {Promise}
 */
const readFilePaths = (startPoint, pattern = /.+/gi, ignore) => {
  const filePaths = [];

  return new Promise((resolve, reject) => {
    klaw(startPoint)
      .on('data', (item) => {
        if (ignore && ignore.test(item.path)) {
          return;
        }

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
 * @param  {Regexp} ignore 需要忽略的文件路径正则
 * @return {Promise}
 */
const readJsonPaths = (startPoint, ignore) => {
  return readFilePaths(startPoint, /\.json$/i, ignore);
};

module.exports = {
  readFilePaths,
  readJsonPaths,
};
