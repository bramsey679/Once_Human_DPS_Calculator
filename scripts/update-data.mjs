import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const dataDir = path.join(root, 'data');

async function readJson(file) {
  const raw = await fs.readFile(path.join(dataDir, file), 'utf8');
  return JSON.parse(raw);
}

async function writeJson(file, value) {
  await fs.writeFile(path.join(dataDir, file), JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function textFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

async function fetchSnapshot(source) {
  const result = {
    id: source.id,
    name: source.name,
    kind: source.kind,
    url: source.url,
    checked_at: new Date().toISOString(),
    ok: false,
    title: null,
    text_hash: null,
    text_excerpt: null,
    error: null
  };

  try {
    const res = await fetch(source.url, { redirect: 'follow' });
    const html = await res.text();
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
    const text = textFromHtml(html).slice(0, 4000);
    result.ok = res.ok;
    result.title = title || source.name;
    result.text_hash = sha256(text);
    result.text_excerpt = text.slice(0, 600);
    result.status = res.status;
  } catch (err) {
    result.error = String(err?.message || err);
  }

  return result;
}

async function main() {
  const sources = await readJson('sources.json');
  const snapshots = [];
  for (const source of sources) {
    snapshots.push(await fetchSnapshot(source));
  }
  await writeJson('source-snapshots.json', snapshots);

  const lines = [
    '# Source refresh report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| id | ok | title | hash |',
    '| --- | --- | --- | --- |'
  ];
  for (const snap of snapshots) {
    lines.push(`| ${snap.id} | ${snap.ok ? 'yes' : 'no'} | ${String(snap.title || '').replace(/\|/g, '\|')} | ${snap.text_hash || ''} |`);
  }
  await fs.writeFile(path.join(dataDir, 'source-report.md'), lines.join('\n') + '\n', 'utf8');

  console.log(`Refreshed ${snapshots.length} source snapshots.`);
}

main().catch(err => {
  console.error(err.stack || err.message || String(err));
  process.exit(1);
});
