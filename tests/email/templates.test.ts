import { describe, it, expect } from 'vitest';
import { renderEmail } from '@/server/email/templates';

describe('email templates', () => {
  it('renders RU and EN differently', () => {
    const ru = renderEmail('ru', 'generation-ready', { projectTitle: 'X' });
    const en = renderEmail('en', 'generation-ready', { projectTitle: 'X' });
    expect(ru.subject).not.toBe('');
    expect(ru.html).toContain('Проект');
    expect(en.subject).not.toBe('');
    expect(ru.subject).not.toBe(en.subject);
  });
});
