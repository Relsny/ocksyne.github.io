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

async function assertMacLauncher(buf) {
  const archive = await JSZip.loadAsync(buf);
  const name = Object.keys(archive.files).find((file) => file.endsWith('.command'));
  if (!name) throw new Error('.command absent du zip');
  const mode = archive.files[name].unixPermissions;
  if (typeof mode !== 'number' || (mode & 0o777) !== 0o755) {
    throw new Error(`${name} n'est pas en mode 755 (${mode == null ? 'absent' : mode.toString(8)})`);
  }
  if ((mode & 0o170000) !== 0o100000) {
    throw new Error(`${name} n'est pas marqué comme fichier régulier (${mode.toString(8)})`);
  }
  const loose = Object.keys(archive.files).filter((file) => !file.includes('/') && /\.txt$/i.test(file));
  if (loose.length) throw new Error(`fichiers .txt en vrac à la racine : ${loose.join(', ')}`);
  const anyTxtOutsideCode = Object.keys(archive.files).filter((file) => /\.txt$/i.test(file) && !file.includes('fichiers-du-bot/') && !file.endsWith('token.txt'));
  if (anyTxtOutsideCode.length) throw new Error(`.txt hors du code : ${anyTxtOutsideCode.join(', ')}`);
  const guide = Object.keys(archive.files).find((file) => file.endsWith('GUIDE.html'));
  const guideText = guide ? await archive.files[guide].async('string') : '';
  if (!guideText.includes('chmod +x')) throw new Error('le guide ne dit pas comment rendre le lanceur Mac exécutable');
}

async function zipBuffer(entries) {
  const zip = new JSZip();
  for (const entry of entries) {
    const mode = entry.unixPermissions != null ? entry.unixPermissions : (entry.exec ? 0o100755 : null);
    zip.file(entry.path, entry.bytes || entry.text, mode == null ? {} : { unixPermissions: mode });
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

function assertNoRule34(text, label) {
  if (/RULE34/i.test(text)) throw new Error(`${label} contient encore RULE34`);
}

function tokenFileIn(dest) {
  for (const name of fs.readdirSync(dest)) {
    const abs = path.join(dest, name);
    if (!fs.statSync(abs).isDirectory() || !name.includes('TOKEN')) continue;
    const inner = path.join(abs, 'token.txt');
    if (fs.existsSync(inner)) return inner;
  }
  return null;
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
  const tokenFile = tokenFileIn(dest);
  if (!tokenFile) throw new Error('token.txt absent du zip');
  const tokenText = fs.readFileSync(tokenFile, 'utf8');
  assertNoRule34(tokenText, tokenFile);
  if (slugs.includes('avatars')) {
    if (!/^LOG_CHANNEL_ID =/m.test(tokenText)) throw new Error('LOG_CHANNEL_ID absent du token avatars');
    const images = fs.readdirSync(dest).find((name) => name.includes('IMAGES INTERDITES'));
    if (!images) throw new Error('dossier IMAGES INTERDITES absent');
    const files = fs.readdirSync(path.join(dest, images));
    const pictures = files.filter((name) => /\.(png|jpe?g|webp|gif)$/i.test(name));
    if (pictures.length < 16) throw new Error(`seulement ${pictures.length} images interdites`);
  } else if (/LOG_CHANNEL_ID/.test(tokenText)) {
    throw new Error('LOG_CHANNEL_ID ne doit être que dans le module avatars');
  }
}

function assertBrandOnly(dir) {
  const skip = new Set(['node_modules', '.git', 'uploads', 'tesseract']);
  function walk(current) {
    for (const name of fs.readdirSync(current)) {
      if (skip.has(name) || name.startsWith('.')) continue;
      const abs = path.join(current, name);
      const stat = fs.statSync(abs);
      if (stat.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!/\.(js|mjs|html|css|md|txt|json)$/i.test(name)) continue;
      const text = fs.readFileSync(abs, 'utf8');
      const banned = 'murr' + 'topia';
      if (text.toLowerCase().includes(banned)) throw new Error(`mot interdit dans ${abs}`);
    }
  }
  walk(dir);
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
  assertBrandOnly(path.join(adminDir, '..'));
  const slugs = Object.keys(saved.modules).sort();
  const legacyName = fs.readdirSync(botDir).find((name) => name.includes('TOKEN') && name.endsWith('.txt'));
  if (!legacyName) throw new Error('modèle de jeton introuvable dans bot/');
  assertNoRule34(fs.readFileSync(path.join(botDir, legacyName), 'utf8'), `bot/${legacyName}`);
  for (const selection of [[], ...slugs.map((slug) => [slug]), slugs]) {
    const label = selection.join(',') || 'vide';
    assertNoRule34(pack.tokenTxt(selection), `tokenTxt(${label})`);
    for (const [key] of pack.keysFor(selection)) assertNoRule34(key, `keysFor(${label})`);
  }
  const jobs = [...slugs.map((slug) => [slug]), slugs];
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dcas-zips-'));
  for (const selection of jobs) {
    const label = selection.length === 1 ? selection[0] : 'complet';
    const entries = buildEntries(saved, selection);
    const buf = await zipBuffer(entries);
    await assertMacLauncher(buf);
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
