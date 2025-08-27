import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  const [common, pages, errors, billing, projects, notifications] = await Promise.all([
    import(`./${locale}/common.json`).then((m) => m.default),
    import(`./${locale}/pages.json`).then((m) => m.default),
    import(`./${locale}/errors.json`).then((m) => m.default),
    import(`./${locale}/billing.json`).then((m) => m.default),
    import(`./${locale}/projects.json`).then((m) => m.default),
    import(`./${locale}/notifications.json`).then((m) => m.default),
  ]);
  return { messages: { common, pages, errors, billing, projects, notifications } };
});
