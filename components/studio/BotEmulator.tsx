'use client';

import { useState } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

export default function BotEmulator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMessage: Message = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch('/api/sandbox/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      const reply = data.message ?? data.reply ?? '';
      const botMessage: Message = { id: Date.now() + 1, sender: 'bot', text: reply };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      const botMessage: Message = { id: Date.now() + 1, sender: 'bot', text: 'Ошибка отправки' };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  return (
    <div className="relative w-80 h-[600px] mx-auto border-4 border-black rounded-[2rem] overflow-hidden bg-background text-text">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl" />
      <div className="flex flex-col h-full pt-6">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map(m => (
            <div
              key={m.id}
              className={`max-w-[75%] p-2 rounded-2xl text-sm ${
                m.sender === 'user'
                  ? 'ml-auto bg-accent text-background'
                  : 'mr-auto bg-card text-text'
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="p-4 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-full bg-card text-text border border-text focus:outline-none"
            placeholder="Сообщение"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-full bg-accent text-background text-sm"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}

