import {readdirSync, readFileSync} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function load(locale: string, file: string) {
  const p = path.join('i18n', locale, file);
  return JSON.parse(readFileSync(p, 'utf8'));
}

function compareKeys(a: any, b: any, prefix = ''): string[] {
  let missing: string[] = [];
  for (const key of Object.keys(a)) {
    if (!(key in b)) {
      missing.push(prefix + key);
    } else if (typeof a[key] === 'object' && a[key] && typeof b[key] === 'object') {
      missing = missing.concat(compareKeys(a[key], b[key], `${prefix}${key}.`));
    }
  }
  return missing;
}

function check() {
  const locales = ['ru', 'en'];
  const files = readdirSync(path.join('i18n', 'ru'));
  let hasMissing = false;
  for (const file of files) {
    const [a, b] = locales.map((l) => load(l, file));
    const missingA = compareKeys(a, b);
    const missingB = compareKeys(b, a);
    if (missingA.length || missingB.length) {
      hasMissing = true;
      if (missingA.length) {
        console.error(`Missing in en:${file}\n` + missingA.join('\n'));
      }
      if (missingB.length) {
        console.error(`Missing in ru:${file}\n` + missingB.join('\n'));
      }
    }
  }
  if (hasMissing) process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  check();
}

export default check;
