'use client';

import { useState } from 'react';
import { Input, Button } from '@/components/ui';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    const currentInput = input;
    setInput('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput })
      });

      const data = await response.json();
      const aiMessage: Message = { role: 'ai', text: data.text ?? '' };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Ошибка при получении ответа AI.' }]);
    }
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.role === 'user' ? 'text-right' : 'text-left'}
          >
            <span
              className={
                msg.role === 'user'
                  ? 'rounded bg-accent px-2 py-1 text-background'
                  : 'rounded bg-muted px-2 py-1'
              }
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Введите сообщение"
        />
        <Button type="submit">Отправить</Button>
      </form>
    </div>
  );
}

