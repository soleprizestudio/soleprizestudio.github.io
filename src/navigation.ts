import { getPermalink } from './utils/permalinks';

// headerData.links below is a fallback only — PageLayout.astro
// overrides it with a version where 게임/앱 are dropdowns built from
// the games/apps collections (전체보기 + one entry per real item).
export const headerData = {
  links: [
    { text: '홈', href: getPermalink('/') },
    { text: '게임', href: getPermalink('/games') },
    { text: '앱', href: getPermalink('/apps') },
    { text: '블로그', href: getPermalink('/blog') },
    { text: '소개', href: getPermalink('/about') },
    { text: '문의', href: getPermalink('/contact') },
  ],
  actions: [],
};

// footerData.links is intentionally left without 게임/앱 —
// PageLayout.astro fills those in dynamically from the games/apps
// collections (so the footer lists real games/apps as sub-links).
export const footerData = {
  links: [
    {
      title: '스튜디오',
      links: [
        { text: '소개', href: getPermalink('/about') },
        { text: '블로그', href: getPermalink('/blog') },
        { text: '문의', href: getPermalink('/contact') },
      ],
    },
  ],
  secondaryLinks: [
    { text: '이용약관', href: getPermalink('/terms') },
    { text: '개인정보처리방침', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'GitHub', icon: 'tabler:brand-github', href: 'https://github.com/soleprizestudio' },
    { ariaLabel: 'Email', icon: 'tabler:mail', href: 'mailto:soleprizestudio@gmail.com' },
  ],
  footNote: `
    © SolePrize Studio · All rights reserved.
  `,
};
