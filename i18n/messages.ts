import { getRequestConfig } from 'next-intl/server'

import { defaultLocale } from './config'

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const l = locale ?? (await requestLocale) ?? defaultLocale
  const [
    common,
    pages,
    errors,
    billing,
    projects,
    notifications,
    copilot,
    testfirst,
    quality,
    obs,
    pricing,
    paywall,
    account,
  ] = await Promise.all([
    import(`./${l}/common.json`).then((m) => m.default),
    import(`./${l}/pages.json`).then((m) => m.default),
    import(`./${l}/errors.json`).then((m) => m.default),
    import(`./${l}/billing.json`).then((m) => m.default),
    import(`./${l}/projects.json`).then((m) => m.default),
    import(`./${l}/notifications.json`).then((m) => m.default),
    import(`./${l}/copilot.json`).then((m) => m.default),
    import(`./${l}/testfirst.json`).then((m) => m.default),
    import(`./${l}/quality.json`).then((m) => m.default),
    import(`./${l}/obs.json`).then((m) => m.default),
    import(`./${l}/pricing.json`).then((m) => m.default),
    import(`./${l}/paywall.json`).then((m) => m.default),
    import(`./${l}/account.json`).then((m) => m.default),
  ])
  return {
    locale: l,
    messages: {
      common,
      pages,
      errors,
      billing,
      projects,
      notifications,
      copilot,
      testfirst,
      quality,
      obs,
      pricing,
      paywall,
      account,
    },
  }
})
