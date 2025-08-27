import type { NotificationPreferenceDTO } from '@/types/domain';
import { getTransport } from './transport';
import { renderEmail, TemplateName } from './templates';

export async function sendEmail(
  user: { email: string; name?: string },
  tpl: TemplateName,
  vars: any,
  prefs: NotificationPreferenceDTO
) {
  try {
    const locale = prefs.locale === 'en' ? 'en' : 'ru';
    const { subject, html, text } = renderEmail(locale, tpl, vars);
    const transport = getTransport();
    await transport.sendMail({
      from: process.env.SMTP_FROM || 'Assiscore <no-reply@assiscore.app>',
      to: `${user.name ? `${user.name} <${user.email}>` : user.email}`,
      subject,
      html,
      text,
    });
    console.log('email prepared', subject);
  } catch (e) {
    console.error('sendEmail error', e);
  }
}
