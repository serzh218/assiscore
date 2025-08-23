import dotenv from 'dotenv';
import OpenAI from 'openai';
import readline from 'node:readline';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

rl.on('line', async (line) => {
  messages.push({ role: 'user', content: line });

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'openai/gpt-4o-mini',
    messages,
  });

  const reply = response.choices[0]?.message?.content;
  if (reply) {
    console.log(reply);
    messages.push({ role: 'assistant', content: reply });
  }
});
