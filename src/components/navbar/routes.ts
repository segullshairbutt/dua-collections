export const TAGS_ROUTES = [
  { name: 'All', url: { pathname: '/duas' } },
  { name: 'Quranic Duas', url: { pathname: '/duas', query: { tag: 'Quran' } } },
  { name: 'Masnoon Duas', url: { pathname: '/duas', query: { tag: 'Masnoon' } } },
  { name: 'Sleeping', url: { pathname: '/duas', query: { tag: 'Sleep' } } },
  { name: 'Mosque', url: { pathname: '/duas', query: { tag: 'Mosque' } } },
  { name: 'House', url: { pathname: '/duas', query: { tag: 'House' } } },
];
