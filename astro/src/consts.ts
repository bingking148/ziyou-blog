// 站点常量（移植自 config/_default/params.yml）
export const SITE_TITLE = 'ZIYOU';
export const SITE_DESCRIPTION = '笔记、草稿，和还在改的学习资料';
export const AUTHOR = 'ZIYOU';
export const SINCE = 2025;

export const MENU = [
  { name: '首页', url: '/' },
  { name: '归档', url: '/archives/' },
  { name: '搜索', url: '/search/' },
  { name: '专栏', url: '/columns/' },
  { name: '学习资料', url: '/learning/' },
  { name: '关于', url: '/about/' },
  { name: '友链', url: '/friend/' },
] as const;

export const SOCIAL = {
  github: 'https://github.com/bingking148',
};

export const TYPING_STRINGS = [
  '草稿比正文长',
  '这处梯度还是不太对',
  '今天也靠咖啡续命',
  '代码能跑，先别碰',
  '学习资料写到损失函数',
  '提交之前再看一眼',
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
