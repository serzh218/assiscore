import { sendEmail } from '../email/sender'

export async function sendAlert({
  level,
  message,
  labels,
}: {
  level: string
  message: string
  labels?: Record<string, string>
}) {
  if (process.env.ALERT_WEBHOOK_URL) {
    await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, labels }),
    })
  }
  if (process.env.ALERT_EMAIL) {
    await sendEmail(
      { email: process.env.ALERT_EMAIL },
      'notification',
      { level, message, labels },
      { locale: 'ru' } as any,
    )
  }
}
