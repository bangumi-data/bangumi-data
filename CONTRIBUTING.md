# Contribute to bangumi data

## 方式

你可以通过以下几种方式来帮助本项目：

* 新建一个 issue，提出数据中的错误之处，或者你想新增的数据。
* 你也可以通过 fork 本项目，添加或修改正确的数据，并发起 Pull Request 的方式来对项目做出贡献。注意请只修改 `data` 目录下的数据，`dist` 目录下的文件会在发版本时自动构建。

## 数据目录结构

```
data/                                --> 原始数据目录
    items/                           --> 番组原始数据目录
        2016/                        --> 以年份分割的目录
            06.json                  --> 以月份分割的目录，番组以开播年月放在对应的文件中
    site/                            --> 站点元数据
        info.json                    --> 资讯站点原始数据
        onair.json                   --> 放送站点原始数据
        resource.json                --> 资源站点原始数据
dist/                                --> 存放构建后数据的目录
    data.json                        --> 构建后的数据文件
```

## 自动生成的字段

所有 `items` 目录中的番组数据会依年月的顺序（均为 GMT+8）填入 `data.json` 的 `items` 数据，并赋予 `年份_月份_序号` 的 `id`。

所有 `sites` 目录中的站点元数据会放入构建后 `data.json` 的 `sites` 对象，并赋予与文件名相同的 `type` 值。

因此 `id` 和 `type` 这两个字段不需要手动添加。

## 字段说明

所有标明为 `required` 的字段必须存在，如无数据则依字段原始类型置空。

所有涉及时间对象的字段，格式均为 [ISO 8601](https://zh.wikipedia.org/zh-hans/ISO_8601) 规范的字符串。

所有涉及语言的字段，格式为 [`[ISO 639-1]-[ISO 15924]?`](https://tools.ietf.org/html/bcp47)，目前已有的为 `ja`、`en`、`zh-Hans`、`zh-Hant`。

### 番组数据

```js
{
    "title": "Re:ゼロから始める異世界生活", // 番组原始标题 [required]
    "titleTranslate": { // 番组标题翻译 [required]
        // 中文简体
        "zh-Hans": [
            // 可存在多个翻译版本，请尽量将广为流传的版本放在最前面（注意：并不一定是最正确的）
            "Re:从零开始的异世界生活",
            "从零开始的异世界生活"
        ],
        // 中文繁体
        "zh-Hant": [
            "Re:從零開始的異世界生活"
        ],
        // 英文翻译
        "en": [
            "Re:Zero -Starting Life in Another World-"
        ]
    },
    "lang": "ja", // 番组语言 [required]
    "officialSite": "http://re-zero-anime.jp/", // 官网 [required]
    "begin": "2016-04-03T16:35:00.000Z", // 番组开始时间，还未确定则置空 [required]
    "end": "", // 番组完结时间，还未确定则置空 [required]
    "comment": "", // 备注 [required]
    "sites": [ // 站点 [required]
        // 放送站点
        {
            "site": "bilibili", // 站点 name，请和最外层 sites 字段中的元数据对应 [required]
            "id": "3461", // 站点 id，可用于替换模板中相应的字段
            "url": "http://www.bilibili.com/sp/物语系列", // url，如果当前url不符合urlTemplate中的规则时使用，优先级高于id
            "official": true, // 是否为官方放送。
            "premuiumOnly": false, // 是否为收费观看。
            "censored": true, // 是否有被和谐的情况存在。
            "lang": "zh-Hans", // 翻译版本（字幕，配音）。
            "begin": "2016-04-03T17:35:00.000Z", // 放送开始时间。
            "comment": "" // 备注
        },
        // 资讯站点
        {
            "site": "bangumi", // 站点 name，请和最外层 sites 字段中的元数据对应 [required]
            "id": "140001" // 站点 id，可用于替换模板中相应的字段
        },
        // 资源（下载）站点
        {
            "site": "dmhy", // 站点 name，请和最外层 sites 字段中的元数据对应 [required]
            "keyword": "從零" // 下载关键词，可用于替换模板中相应的字段
        }
    ]
}
```

### 站点元数据

```js
{
    // 站点字段名，和番组数据中 sites 数组中元素的 site 字段名对应
    "bangumi": {
        "title": "番组计划", // 站点名称 [required]
        "urlTemplate": "http://bangumi.tv/subject/{{id}}" // 站点 url 模板
    }
}
```

## 站点 url 拼接

通过站点的 `site` 字段获取到站点元数据中相应的 `urlTemplate`，并用相应的字段数据替换掉模板中用两层花括号包裹的占位符。

例如：`id` 为 `12345`，`urlTemplate` 为 `http://www.a.com/?id={{id}}`，则替换后为 `http://www.a.com/?id=12345`

各个放送站点的 url 均为专辑页面，以下列表中，突出部分为 id：

* http&#58;//www.acfun.tv/v/ab<kbd>1480039</kbd>
* http&#58;//bangumi.bilibili.com/anime/<kbd>5507</kbd>
* http&#58;//www.iqiyi.com/<kbd>a_19rrh9uqb5</kbd>.html
* http&#58;//movie.kankan.com/movie/<kbd>87458</kbd>
* http&#58;//www.le.com/comic/<kbd>10029954</kbd>.html
* http&#58;//www.mgtv.com/h/<kbd>301218</kbd>.html
* http&#58;//v.pptv.com/page/<kbd>adq2NJwCcrATkfk</kbd>.html
* http&#58;//tv.sohu.com/<kbd>s2011/yjdwb/</kbd>
* http&#58;//v.qq.com/detail/<kbd>g/gyf3u5vx0m42531</kbd>.html
* http&#58;//www.tudou.com/albumcover/<kbd>uu4R6eeDa8Q</kbd>.html
* http&#58;//www.youku.com/show_page/id_z<kbd>4d8cce35815111e6b16e</kbd>.html

## 验证

运行 `npm run validate` 来验证所有原始数据格式是否正确。

## 构建

运行 `npm run build` 来构建 `data.json`。构建过程中会自动对数据格式进行校验，如果通不过则构建失败。
