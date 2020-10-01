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

所有 `items` 目录中的番组数据会依年月的顺序（均为 GMT+8）填入 `data.json` 的 `items` 数据。

所有 `siteMeta` 目录中的站点元数据会放入构建后 `data.json` 的 `sites` 对象，并赋予与文件名相同的 `type` 值。因此 `type` 这个字段不需要手动添加。

## 字段说明

所有标明为 `required` 的字段必须存在，如无数据则依字段原始类型置空。

所有涉及时间对象的字段，格式均为 [ISO 8601](https://zh.wikipedia.org/zh-hans/ISO_8601) 规范的字符串。

所有涉及语言的字段，格式为 [`[ISO 639-1]-[ISO 15924]?`](https://tools.ietf.org/html/bcp47)，目前已有的为 `ja`、`en`、`zh-Hans`、`zh-Hant`。

单个番组中的 `type` 字段可选的有 `tv`、`web`、`ova`、`movie`。

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
    "type": "tv", // 番组类型 [required]
    "lang": "ja", // 番组语言 [required]
    "officialSite": "http://re-zero-anime.jp/", // 官网 [required]
    "begin": "2016-04-03T16:35:00.000Z", // tv/web：番组开始时间；movie：上映日期；ova：首话发售时间 [required]
    "broadcast": "R/2016-04-03T16:35:00.000Z/P7D", // 放送周期，见下方详细说明
    "end": "", // tv/web：番组完结时间；movie：无意义；ova：则为最终话发售时间（未确定则置空） [required]
    "comment": "", // 备注
    "sites": [ // 站点 [required]
        // 放送站点
        {
            "site": "bilibili", // 站点 name，请和最外层 sites 字段中的元数据对应 [required]
            "id": "3461", // 站点 id，可用于替换模板中相应的字段
            "url": "http://www.bilibili.com/sp/物语系列", // url，如果当前url不符合urlTemplate中的规则时使用，优先级高于id
            "begin": "2016-04-03T17:35:00.000Z", // 放送开始时间。
            "broadcast": "R/2016-04-03T17:35:00.000Z/P7D", // 放送周期，见下方详细说明
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
            "id": "從零" // 下载关键词，可用于替换模板中相应的字段
        }
    ]
}
```

#### 关于`broadcast`字段

本字段用于描述番剧的播放周期信息，会同时存在于番剧信息和播放站点的信息中。

原本的`begin`字段仅描述了番剧的播放开始时间，当长期连载或其他原因造成播放时间产生变动时，其所对应的数据和实际的播放时间会产生矛盾，并且默认了播放周期为7天，这与实际情况有时会不符。详细可见[讨论](https://github.com/bangumi-data/bangumi-data/issues/106)。

因此，如果需要展示番剧的播放时间或周期时，建议使用`broadcast`字段代替`begin`。但是需要注意，本字段为可选字段，如果不存在或为空，可以fallback到`begin`字段，使用时请做好兼容。

另外，`broadcast`仅在番剧未完结时有意义。若在播放中出现变更，会更新到最新的数据，但是完结后便不再更新。

目前支持的`broadcast`字段为以下几种格式：

* 一次性: `R/2020-01-01T13:00:00Z/P0D`，一般用于剧场版、OVA等
* 周播: `R/2020-01-01T13:00:00Z/P7D`，TV动画最常见的周期形式
* 日播: `R/2020-01-01T13:00:00Z/P1D`
* 月播: `R/2020-01-01T13:00:00Z/P1M`

### 站点元数据

```js
{
    // 站点字段名，和番组数据中 sites 数组中元素的 site 字段名对应
    "bangumi": {
        "title": "番组计划", // 站点名称 [required]
        "urlTemplate": "https://bangumi.tv/subject/{{id}}" // 站点 url 模板 [required]
    }
}
```

## 站点 url 拼接

通过站点的 `site` 字段获取到站点元数据中相应的 `urlTemplate`，并用相应的字段数据替换掉模板中用两层花括号包裹的占位符。

例如：`id` 为 `12345`，`urlTemplate` 为 `https://www.a.com/?id={{id}}`，则替换后为 `https://www.a.com/?id=12345`

各个放送站点的 url 均为专辑页面，以下列表中，突出部分为 id：

* [https://www.acfun.cn/bangumi/aa<kbd>5022161</kbd>](https://www.acfun.cn/bangumi/aa5022161)
* [https://www.bilibili.com/bangumi/media/md<kbd>5507</kbd>](https://www.bilibili.com/bangumi/media/md5507)
* [https://www.iqiyi.com/<kbd>a_19rrh9uqb5</kbd>.html](https://www.iqiyi.com/a_19rrh9uqb5.html)
* [https://www.le.com/comic/<kbd>10029954</kbd>.html](https://www.le.com/comic/10029954.html)
* [https://www.mgtv.com/h/<kbd>301218</kbd>.html](https://www.mgtv.com/h/301218.html)
* [https://ch.nicovideo.jp/<kbd>kemono-friends</kbd>](https://ch.nicovideo.jp/kemono-friends)
* [http://v.pptv.com/page/<kbd>adq2NJwCcrATkfk</kbd>.html](http://v.pptv.com/page/adq2NJwCcrATkfk.html)
* [https://tv.sohu.com/<kbd>s2011/yjdwb</kbd>](https://tv.sohu.com/s2011/yjdwb/)
* [https://v.qq.com/detail/<kbd>g/gyf3u5vx0m42531</kbd>.html](https://v.qq.com/detail/g/gyf3u5vx0m42531.html)
* [https://list.youku.com/show/id_z<kbd>4d8cce35815111e6b16e</kbd>.html](https://list.youku.com/show/id_z4d8cce35815111e6b16</kbd>.html)
* [https://www.netflix.com/title/<kbd>81033445</kbd>](https://www.netflix.com/title/81033445)

## 验证

运行 `npm run validate` 来验证所有原始数据格式是否正确。

## 构建

运行 `npm run build` 来构建 `data.json`。构建过程中会自动对数据格式进行校验，如果通不过则构建失败。
