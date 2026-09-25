import { SITE } from 'astrowind:config';

export const DEFAULT_LOCALE = 'ko' as const;
export const LOCALES = ['ko', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};

/** BCP-47 tags for <html lang> and hreflang. */
export const LOCALE_TAGS: Record<Locale, string> = {
  ko: 'ko',
  en: 'en',
};

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

/** Reads the active locale off the URL. Anything not under /en/ is the default locale. */
export function getLocaleFromUrl(url: URL): Locale {
  const [, first] = url.pathname.split('/');
  return first && isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}

/**
 * Prefixes a site-root-relative path with the locale.
 * The default locale stays unprefixed so existing Korean URLs never move.
 *
 * The result carries a trailing slash when the site is configured for one, so
 * nav links, the language switcher and hreflang all name the URL the host
 * actually serves rather than the one it redirects away from.
 */
export function localePath(path: string, locale: Locale): string {
  const clean = `/${path.replace(/^\/+/, '')}`.replace(/\/$/, '') || '/';
  const prefixed = locale === DEFAULT_LOCALE ? clean : clean === '/' ? `/${locale}` : `/${locale}${clean}`;
  return SITE.trailingSlash && prefixed !== '/' ? `${prefixed}/` : prefixed;
}

/** Strips the locale prefix, giving the shared path used to pair translations for hreflang. */
export function stripLocale(pathname: string): string {
  const clean = pathname.replace(/\/$/, '') || '/';
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (clean === `/${locale}`) return '/';
    if (clean.startsWith(`/${locale}/`)) return clean.slice(locale.length + 1);
  }
  return clean;
}

const ui = {
  ko: {
    'nav.home': '홈',
    'nav.games': '게임',
    'nav.apps': '앱',
    'nav.blog': '블로그',
    'nav.about': '소개',
    'nav.contact': '문의',
    'nav.terms': '이용약관',
    'nav.privacy': '개인정보처리방침',

    'home.subtitle': '취미로 앱과 게임을 만드는 1인 개발자입니다.',
    'home.viewGames': '게임 보러가기',
    'home.viewApps': '앱 보러가기',
    'home.whatIMake': '무엇을 만드나요',
    'home.games.desc': '부담 없이 즐길 수 있는 게임을 만듭니다.',
    'home.apps.desc': '유용하고 재미있는 앱을 만듭니다.',
    'home.about.desc': '스튜디오에 대해 더 알아보세요.',
    'home.blog.desc': '만들면서 겪은 것들을 기록합니다.',
    'home.seeGames': '게임 보기',
    'home.seeApps': '앱 보기',
    'home.seeBlog': '블로그 보기',
    'home.seeAbout': '소개 보기',
    'home.cta.title': '더 궁금한 게 있으신가요?',
    'home.cta.subtitle': '스튜디오 소개를 보시거나, 편하게 연락 주세요.',
    'home.cta.action': '문의하기',

    'games.title': '게임',
    'games.subtitle': '브라우저에서 바로 즐길 수 있는 게임',
    'games.intro':
      '설치도 가입도 없습니다. 주소만 열면 그 자리에서 돌아갑니다. 필요한 순간에 바로 써야 하는 것들이라 앱 대신 웹으로 만들었습니다.',
    'games.empty': '아직 등록된 게임이 없어요 — 곧 올라올 예정입니다!',
    'games.openInNewTab': '새 탭에서 크게 보기',
    'games.thumbnailAlt': '썸네일',
    'games.viewDetail': '자세히 보기',

    'apps.title': '앱',
    'apps.subtitle': '스토어에 올린 앱과 브라우저에서 도는 앱',
    'apps.intro':
      '쓸 일이 있어서 만들었고 쓸 만해서 올려뒀습니다. 하나는 앱 스토어에서 받아 쓰고, 하나는 주소만 열면 바로 돌아갑니다.',
    'apps.empty': '아직 등록된 앱이 없어요 — 곧 올라올 예정입니다!',
    'apps.viewDetail': '자세히 보기',
    'apps.iconAlt': '아이콘',
    'apps.privacy': '개인정보처리방침',
    'apps.downloadAria': 'App Store에서 다운로드',

    'about.title': '소개',
    'about.subtitle': '취미로 앱과 게임을 만드는 1인 개발자, SolePrize Studio입니다.',

    'contact.title': '문의하기',
    'contact.formTitle': '메시지를 남겨주세요',
    'contact.emailNote': '이메일로도 연락 가능합니다: soleprizestudio@gmail.com',
    'contact.name': '이름',
    'contact.email': '이메일',
    'contact.message': '메시지',
    'contact.disclaimer': '문의 폼을 제출하면 입력하신 개인정보 수집에 동의하게 됩니다.',
    'contact.sent': '문의가 접수되었습니다. 확인하는 대로 답장드리겠습니다.',
    'contact.intro': '이런 연락을 기다립니다.',
    'contact.replyNote': '혼자 주말에 작업하고 있어서 답장이 늦을 수 있습니다. 확인하는 대로 답장드리겠습니다.',
    'contact.subject': 'SolePrize Studio 웹사이트 문의',

    'notFound.title': '페이지를 찾을 수 없어요',
    'notFound.body': '주소가 바뀌었거나 삭제된 페이지일 수 있습니다.',
    'notFound.home': '홈으로 돌아가기',

    'toc.title': '목차',
    'toc.empty': '목차가 없습니다.',
    'toc.top': '맨 위로',
    'toc.comments': '댓글로 이동',
    'toc.copy': '링크 복사',
    'toc.copied': '복사됨!',

    'lang.switchTo': 'English로 보기',
  },
  en: {
    'nav.home': 'Home',
    'nav.games': 'Games',
    'nav.apps': 'Apps',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.terms': 'Terms',
    'nav.privacy': 'Privacy Policy',

    'home.subtitle': 'A solo developer making apps and games as a hobby.',
    'home.viewGames': 'Browse Games',
    'home.viewApps': 'Browse Apps',
    'home.whatIMake': 'What I make',
    'home.games.desc': 'Games you can pick up and enjoy without any pressure.',
    'home.apps.desc': 'Small apps that are useful and fun to use.',
    'home.about.desc': 'Learn more about the studio.',
    'home.blog.desc': 'Notes on what I ran into while building things.',
    'home.seeGames': 'See Games',
    'home.seeApps': 'See Apps',
    'home.seeBlog': 'See Blog',
    'home.seeAbout': 'See About',
    'home.cta.title': 'Want to know more?',
    'home.cta.subtitle': 'Read about the studio, or just get in touch.',
    'home.cta.action': 'Get in touch',

    'games.title': 'Games',
    'games.subtitle': 'Games you can play right in the browser',
    'games.intro':
      'Nothing to install, no account to make. Open the address and it runs. These are things you need the moment you need them, so they are web pages rather than apps.',
    'games.empty': 'No games here yet — something is on the way!',
    'games.openInNewTab': 'Open in a new tab',
    'games.thumbnailAlt': 'thumbnail',
    'games.viewDetail': 'View details',

    'apps.title': 'Apps',
    'apps.subtitle': 'Apps on the store, and apps that run in your browser',
    'apps.intro':
      'Built because I needed them, put up because they turned out useful. One you download from the App Store; the other runs as soon as you open the address.',
    'apps.empty': 'No apps here yet — something is on the way!',
    'apps.viewDetail': 'View details',
    'apps.iconAlt': 'icon',
    'apps.privacy': 'Privacy Policy',
    'apps.downloadAria': 'Download on the App Store',

    'about.title': 'About',
    'about.subtitle': 'SolePrize Studio — a solo developer making apps and games as a hobby.',

    'contact.title': 'Contact',
    'contact.formTitle': 'Send a message',
    'contact.emailNote': 'You can also email me: soleprizestudio@gmail.com',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.disclaimer': 'By submitting this form you consent to the collection of the details you entered.',
    'contact.sent': "Your message was sent. I'll reply once I've read it.",
    'contact.intro': "Here's what I'd love to hear about:",
    'contact.replyNote':
      "I work on this alone, on weekends, so replies can take a while. I'll answer once I've read your message.",
    'contact.subject': 'SolePrize Studio website enquiry',

    'notFound.title': 'Page not found',
    'notFound.body': 'The address may have changed, or the page may have been removed.',
    'notFound.home': 'Back to home',

    'toc.title': 'Contents',
    'toc.empty': 'No headings on this page.',
    'toc.top': 'Back to top',
    'toc.comments': 'Jump to comments',
    'toc.copy': 'Copy link',
    'toc.copied': 'Copied!',

    'lang.switchTo': '한국어로 보기',
  },
} as const;

export type UIKey = keyof (typeof ui)['ko'];

export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale][key] ?? ui[DEFAULT_LOCALE][key];
  };
}
