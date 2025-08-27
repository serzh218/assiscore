export type TemplateName =
  | 'generation-ready'
  | 'generation-error'
  | 'patch-ready'
  | 'patch-error'
  | 'deploy-ready'
  | 'deploy-error'
  | 'billing-created'
  | 'billing-succeeded'
  | 'billing-canceled';

type TemplateFunc = (vars: any) => { subject: string; body: string };

const templates: Record<TemplateName, { ru: TemplateFunc; en: TemplateFunc }> = {
  'generation-ready': {
    ru: (v) => ({ subject: 'Проект готов', body: `${v.projectTitle} собран` }),
    en: (v) => ({ subject: 'Project ready', body: `${v.projectTitle} built` })
  },
  'generation-error': {
    ru: () => ({ subject: 'Ошибка генерации', body: 'Посмотрите логи' }),
    en: () => ({ subject: 'Generation error', body: 'See logs for details' })
  },
  'patch-ready': {
    ru: () => ({ subject: 'Доработка применена', body: 'Патч выполнен' }),
    en: () => ({ subject: 'Patch applied', body: 'Patch completed' })
  },
  'patch-error': {
    ru: () => ({ subject: 'Ошибка патча', body: 'Проверьте логи' }),
    en: () => ({ subject: 'Patch error', body: 'Check logs' })
  },
  'deploy-ready': {
    ru: (v) => ({ subject: 'Сайт опубликован', body: v.deployUrl ? `Доступен по ${v.deployUrl}` : 'Готово' }),
    en: (v) => ({ subject: 'Site deployed', body: v.deployUrl ? `Available at ${v.deployUrl}` : 'Done' })
  },
  'deploy-error': {
    ru: () => ({ subject: 'Ошибка публикации', body: 'Проверьте логи' }),
    en: () => ({ subject: 'Deploy error', body: 'Check logs' })
  },
  'billing-created': {
    ru: () => ({ subject: 'Оплата создана', body: 'Перейдите для подтверждения' }),
    en: () => ({ subject: 'Payment created', body: 'Proceed to confirm' })
  },
  'billing-succeeded': {
    ru: () => ({ subject: 'Оплата успешна', body: 'План активирован' }),
    en: () => ({ subject: 'Payment succeeded', body: 'Plan activated' })
  },
  'billing-canceled': {
    ru: () => ({ subject: 'Оплата отменена', body: 'Платеж отменён' }),
    en: () => ({ subject: 'Payment canceled', body: 'Payment was cancelled' })
  }
};

export function renderEmail(locale: 'ru' | 'en', tpl: TemplateName, vars: any) {
  const t = templates[tpl][locale];
  const { subject, body } = t(vars);
  const cta = vars.ctaUrl ? `<p><a href="${vars.ctaUrl}">Open</a></p>` : '';
  const html = `<html><body><h1>${subject}</h1><p>${body}</p>${cta}</body></html>`;
  const text = `${subject}\n\n${body}${vars.ctaUrl ? `\n${vars.ctaUrl}` : ''}`;
  return { subject, html, text };
}
