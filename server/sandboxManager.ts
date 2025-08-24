import { Sandbox } from '@e2b/code-interpreter';
import { EventEmitter } from 'events';

interface SandboxEntry {
  sandbox: Sandbox;
  emitter: EventEmitter;
}

const sandboxes = new Map<string, SandboxEntry>();

export async function getSandboxEntry(id: string): Promise<SandboxEntry> {
  let entry = sandboxes.get(id);
  if (!entry) {
    const sandbox = await Sandbox.reconnect(id);
    entry = { sandbox, emitter: new EventEmitter() };
    sandboxes.set(id, entry);
  }
  return entry;
}

export function getEmitter(id: string): EventEmitter | undefined {
  return sandboxes.get(id)?.emitter;
}

export function removeSandbox(id: string) {
  sandboxes.delete(id);
}
