import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    { text: '홈', href: getPermalink('/') },
    { text: '게임', href: getPermalink('/games') },
    { text: '앱', href: getPermalink('/apps') },
    { text: '소개', href: getPermalink('/about') },
    { text: '문의', href: getPermalink('/contact') },
  ],
  actions: [],
};

export const footerData = {
  links: [],
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
