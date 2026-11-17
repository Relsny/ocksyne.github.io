// Construit les zips comme le panneau (manifeste + JSZip) et vérifie qu'ils démarrent.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const adminDir = path.dirname(new URL(import.meta.url).pathname);
const botDir = path.join(adminDir, 'bot');
const JSZip = require(path.join(adminDir, 'vendor/jszip.min.js'));
const pack = require(path.join(adminDir, 'packaging.js'));
const { buildManifest } = require(path.join(adminDir, 'scripts/build-manifest.js'));

function keptCodePath(file) {
  if (file.includes('METS TON TOKEN')) return false;
  if (file === 'enabled.json') return false;
  return true;
}

function readText(rel) {
  return fs.readFileSync(path.join(botDir, rel));
}

function buildEntries(manifest, slugs) {
  const names = Object.fromEntries(slugs.map((slug) => [slug, slug]));
  const readmes = {};
  for (const slug of slugs) {
    const readme = (manifest.modules[slug] || []).find((file) => file.endsWith('README.md'));
    if (readme) readmes[slug] = fs.readFileSync(path.join(botDir, readme), 'utf8');
  }
  const paths = manifest.base.filter(keptCodePath);
  for (const slug of slugs) paths.push(...(manifest.modules[slug] || []));
  const codeFiles = paths.map((file) => ({ path: file, text: readText(file) }));
  const logoBytes = fs.readFileSync(path.join(adminDir, 'logo.png'));
  return pack.entries({ slugs, names, readmes, logoBytes, codeFiles });
}

async function zipBuffer(entries) {
  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry.path, entry.bytes || entry.text, entry.exec ? { unixPermissions: 0o755 } : {});
  }
  return zip.generateAsync({ type: 'nodebuffer', platform: 'UNIX' });
}

function relativeRequires(file, source) {
  const found = [];
  const re = /require\(\s*['"](\.[^'"]+)['"]\s*\)/g;
  for (const match of source.matchAll(re)) found.push(match[1]);
  return found;
}

function resolves(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [base, `${base}.js`, `${base}.json`, `${base}.node`, path.join(base, 'index.js')];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function checkTree(dest, slugs) {
  const top = fs.readdirSync(dest);
  const codeName = top.find((name) => name.includes('fichiers-du-bot'));
  if (!codeName) throw new Error('dossier du code absent');
  const codeDir = path.join(dest, codeName);
  if (!fs.existsSync(path.join(codeDir, 'src', 'token.js'))) throw new Error('src/token.js absent du zip');
  if (!fs.existsSync(path.join(codeDir, 'src', 'brand.js'))) throw new Error('src/brand.js absent du zip');
  const jsFiles = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      if (name === 'node_modules') continue;
      const abs = path.join(dir, name);
      if (fs.statSync(abs).isDirectory()) walk(abs);
      else if (name.endsWith('.js')) jsFiles.push(abs);
    }
  }
  walk(codeDir);
  for (const file of jsFiles) execFileSync('node', ['--check', file], { stdio: 'pipe' });
  for (const file of jsFiles) {
    const source = fs.readFileSync(file, 'utf8');
    for (const spec of relativeRequires(file, source)) {
      if (!resolves(file, spec)) throw new Error(`${path.relative(codeDir, file)} ne trouve pas ${spec}`);
    }
  }
  let message = '';
  try {
    execFileSync('node', ['-e', `
      const { loadToken } = require('./src/token');
      try { loadToken(process.cwd()); process.exit(2); }
      catch (error) { console.error(error.message); process.exit(1); }
    `], { cwd: codeDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    message = `${error.stdout || ''}${error.stderr || ''}`;
    if (error.status === 2) throw new Error('le jeton exemple a été accepté');
  }
  if (!message.includes('token.txt') || !message.includes('DISCORD_TOKEN')) {
    throw new Error(`message du chargeur inattendu : ${message}`);
  }
  for (const slug of slugs) {
    if (!fs.existsSync(path.join(codeDir, 'modules', slug, 'module.js'))) {
      throw new Error(`module ${slug} absent`);
    }
  }
}

async function main() {
  const fresh = buildManifest();
  const saved = JSON.parse(fs.readFileSync(path.join(adminDir, 'manifest.json'), 'utf8'));
  if (JSON.stringify(fresh) !== JSON.stringify(saved)) {
    throw new Error('manifest.json ne correspond pas au dossier bot. Relance scripts/build-manifest.js');
  }
  for (const file of ['src/token.js', 'src/brand.js']) {
    if (!saved.base.includes(file)) throw new Error(`${file} manque dans manifest.json`);
  }
  const slugs = Object.keys(saved.modules).sort();
  const jobs = [...slugs.map((slug) => [slug]), slugs];
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dcas-zips-'));
  for (const selection of jobs) {
    const label = selection.length === 1 ? selection[0] : 'complet';
    const entries = buildEntries(saved, selection);
    const buf = await zipBuffer(entries);
    const zipPath = path.join(root, `${label}.zip`);
    const dest = path.join(root, label);
    fs.writeFileSync(zipPath, buf);
    fs.mkdirSync(dest);
    execFileSync('unzip', ['-q', zipPath, '-d', dest]);
    checkTree(dest, selection);
    console.log(`ok ${label} (${selection.length} module${selection.length > 1 ? 's' : ''})`);
  }
  console.log(`ZIPS OK ${jobs.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
