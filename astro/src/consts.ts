// 站点常量（移植自 config/_default/params.yml）
export const SITE_TITLE = 'ZIYOU';
export const SITE_DESCRIPTION = '在键盘上写下又一行注释';
export const AUTHOR = 'ZIYOU';
export const SINCE = 2025;

export const MENU = [
  { name: '首页', url: '/' },
  { name: '归档', url: '/archives/' },
  { name: '搜索', url: '/search/' },
  { name: '专栏', url: '/columns/' },
  { name: '关于', url: '/about/' },
  { name: '友链', url: '/friend/' },
] as const;

export const SOCIAL = {
  github: 'https://github.com/bingking148',
};

export const TYPING_STRINGS = [
  '在键盘上写下又一行注释',
  '今天也靠咖啡续命',
  '代码能跑，先别碰',
  '写过的最好的代码，是没写的那段',
  '先把需求理清，再谈架构',
  '下班前的最后一次 commit',
];

export const WALINE = {
  serverURL: 'https://comment.ziyou814.top',
  emoji: [
    'https://unpkg.com/@waline/emojis@1.2.0/weibo',
    'https://unpkg.com/@waline/emojis@1.2.0/alus',
    'https://unpkg.com/@waline/emojis@1.2.0/bilibili',
    'https://unpkg.com/@waline/emojis@1.2.0/qq',
    'https://unpkg.com/@waline/emojis@1.2.0/tieba',
    'https://unpkg.com/@waline/emojis@1.2.0/tw-emoji',
  ],
};

export const OUTDATE_DAYS = 180;
export const RSS_LIMIT = 10;
export const DEFAULT_COVER = '/images/covers/cover1.jpg';
