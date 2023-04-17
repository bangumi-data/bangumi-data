declare type SiteType = "info" | "onair" | "resource";

declare type Language = "ja" | "en" | "zh-Hans" | "zh-Hant";

declare type ItemType = "tv" | "web" | "movie" | "ova";

/**
 * 站点
 */
declare type Site = OnairSite | InfoSite | ResourceSite;

/**
 * 站点元数据
 */
declare interface SiteMeta {
    /**
     * 站点名称
     */
    title: string;

    /**
     * 站点 url 模板
     */
    urlTemplate: string;

    /**
     * 站点区域限制，主要针对onAir类型的放送站点。如无该字段，表明该站点无区域限制
     */
    regions?: string[];

    /**
     * 站点类型: info, onair, resource
     */
    type: SiteType;
}

/**
 * 放送站点
 */
declare interface OnairSite {
    /**
     * 站点 name，请和最外层 sites 字段中的元数据对应
     */
    site: string;

    /**
     * 站点 id，可用于替换模板中相应的字段
     */
    id: string;

    /**
     * url，如果当前url不符合urlTemplate中的规则时使用，优先级高于id
     */
    url?: string;

    /**
     * 放送开始时间
     */
    begin: string;

    /**
     * 放送周期
     */
    broadcast?: string;

    /**
     * tv/web: 番组完结时间;
     * movie: 无意义;
     * ova: 则为最终话发售时间（未确定则置空）.
     */
    end?: string;

    /**
     * 备注
     */
    comment?: string;

    /**
     * 番剧放送站点区域限制，用于覆盖站点本身的区域限制
     */
    regions: string[];
}

/**
 * 资讯站点
 */
declare interface InfoSite {
    /**
     * 站点 name，请和最外层 sites 字段中的元数据对应
     */
    site: string;

    /**
     * 站点 id，可用于替换模板中相应的字段
     */
    id: string;
}

/**
 * 资源（下载）站点
 */
declare interface ResourceSite {
    /**
     * 站点 name，请和最外层 sites 字段中的元数据对应
     */
    site: string;

    /**
     * 下载关键词，可用于替换模板中相应的字段
     */
    id: string;
}

/**
 * 番组数据
 */
declare interface Item {
    /**
     * 番组原始标题
     */
    title: string;

    /**
     * 番组标题翻译
     */
    titleTranslate: Record<Language, string[]>;

    /**
     * 番组类型
     */
    type: ItemType;

    /**
     * 番组语言
     */
    lang: Language;

    /**
     * 官网
     */
    officialSite: string;

    /**
     * tv/web: 番组开始时间;
     * movie: 上映日期;
     * ova: 首话发售时间.
     */
    begin: string;

    /**
     * 放送周期
     *
     * 参考 https://github.com/bangumi-data/bangumi-data/blob/master/CONTRIBUTING.md#%E5%85%B3%E4%BA%8Ebroadcast%E5%AD%97%E6%AE%B5
     */
    broadcast?: string;

    /**
     * tv/web: 番组完结时间;
     * movie: 无意义;
     * ova: 则为最终话发售时间（未确定则置空）.
     */
    end: string;

    /**
     * 备注
     */
    comment?: string;

    /**
     * 站点
     */
    sites: Site[];
}

type SiteList =
    | "bangumi"
    | "acfun"
    | "bilibili"
    | "bilibili_hk_mo_tw"
    | "bilibili_hk_mo"
    | "bilibili_tw"
    | "sohu"
    | "youku"
    | "qq"
    | "iqiyi"
    | "letv"
    | "pptv"
    | "mgtv"
    | "nicovideo"
    | "netflix"
    | "gamer"
    | "muse_hk"
    | "ani_one"
    | "ani_one_asia"
    | "viu"
    | "mytv"
    | "disneyplus"
    | "nowPlayer"
    | "dmhy";

export const siteMeta: Record<SiteList, SiteMeta>;

export const items: Item[];
