// Renders QA stills and labelled contact sheets from one bundle.
//
//   node qa/stills.mjs                     every QA frame from qa/frames.ts
//   node qa/stills.mjs --scenes a,b        only those scenes
//   node qa/stills.mjs --frames 120,455    exact frames (full size, no sheet)
//   node qa/stills.mjs --overview 25       one sheet of N frames spread over the video
//
// Stills land in out/qa/stills, sheets in out/qa/sheets (2 x 3 tiles at half
// size, each labelled with scene, frame and time). Prints the sheet paths and
// any timeline warnings.
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'out', 'qa');
const STILLS = path.join(OUT, 'stills');
const SHEETS = path.join(OUT, 'sheets');
fs.mkdirSync(STILLS, {recursive: true});
fs.mkdirSync(SHEETS, {recursive: true});

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
};
const video = JSON.parse(fs.readFileSync(path.join(ROOT, 'video.json'), 'utf8'));

// 1. Frame list and timeline lint, computed from the real timeline code.
execFileSync(
  path.join(ROOT, 'node_modules', '.bin', 'esbuild'),
  ['qa/frames.ts', '--bundle', '--platform=node', '--format=cjs', '--jsx=automatic', '--packages=external', '--log-level=error', `--outfile=${path.join(OUT, 'frames.cjs')}`],
  {cwd: ROOT, stdio: 'inherit'},
);
const plan = JSON.parse(execFileSync('node', [path.join(OUT, 'frames.cjs')], {cwd: ROOT, encoding: 'utf8'}));

// What is said when, for checking sync.
const text = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'script.json'), 'utf8')).map((l) => [l.id, l.text]));
fs.writeFileSync(
  path.join(OUT, 'lines.txt'),
  plan.lines.map((l) => `${String(l.id).padStart(2, '0')}  f${l.from} to f${l.to}  (${(l.from / 30).toFixed(1)}s)  [${l.scene}]  ${text[l.id]}`).join('\n') + '\n',
);

const sceneAt = (frame) => {
  let name = '';
  for (const f of plan.frames) if (f.frame <= frame) name = f.scene;
  return name;
};

let jobs;
let mode = 'scenes';
if (arg('--frames')) {
  mode = 'frames';
  jobs = arg('--frames').split(',').map((f) => ({scene: sceneAt(Number(f)) || 'frame', frame: Number(f)}));
} else if (arg('--overview')) {
  mode = 'overview';
  const n = Number(arg('--overview'));
  jobs = Array.from({length: n}, (_, i) => {
    const frame = Math.round(((i + 0.5) / n) * (plan.total - 1));
    return {scene: sceneAt(frame), frame};
  });
} else {
  const only = arg('--scenes')?.split(',');
  jobs = plan.frames.filter((f) => !only || only.includes(f.scene));
}
if (jobs.length === 0) {
  console.error('No frames to render. Check the scene names.');
  process.exit(1);
}

// 2. Render. Old stills of the same scenes go first, so nobody reviews a stale frame.
if (mode !== 'frames') {
  const scenesInJobs = new Set(jobs.map((j) => j.scene));
  for (const f of fs.readdirSync(STILLS)) {
    const scene = f.replace(/^\d+-/, '').replace(/\.png$/, '');
    if (mode === 'overview' ? false : scenesInJobs.has(scene)) fs.unlinkSync(path.join(STILLS, f));
  }
}

const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src', 'index.ts'), rootDir: ROOT, publicDir: path.join(ROOT, 'public')});
const browser = await openBrowser('chrome');
const composition = await selectComposition({serveUrl, id: video.compositionId, inputProps: {}, puppeteerInstance: browser, logLevel: 'error'});
const fileFor = (j) => path.join(STILLS, `${String(j.frame).padStart(5, '0')}-${j.scene}.png`);

const queue = [...jobs];
const worker = async () => {
  while (queue.length) {
    const j = queue.shift();
    await renderStill({composition, serveUrl, output: fileFor(j), frame: j.frame, imageFormat: 'png', inputProps: {}, puppeteerInstance: browser, overwrite: true, logLevel: 'error'});
  }
};
await Promise.all([worker(), worker(), worker()]);
await browser.close({silent: true});

// 3. Contact sheets.
const tiles = jobs.map((j) => ({file: fileFor(j), label: `${j.scene}  f${j.frame}  ${(j.frame / 30).toFixed(2)}s`, scene: j.scene}));
let sheets = [];
if (mode === 'frames') {
  sheets = tiles.map((t) => t.file);
} else {
  const order = [...new Set(tiles.map((t) => t.scene))];
  const groups = mode === 'overview' ? [{name: 'overview', tiles, cols: 5}] : order.map((s) => ({name: s, tiles: tiles.filter((t) => t.scene === s), cols: 2}));
  const manifest = path.join(OUT, 'sheets.json');
  fs.writeFileSync(manifest, JSON.stringify(groups.map((g) => ({...g, index: plan.frames.findIndex((f) => f.scene === g.name)}))));
  const py = fs.existsSync(path.join(ROOT, 'tts', '.venv', 'bin', 'python')) ? path.join(ROOT, 'tts', '.venv', 'bin', 'python') : 'python3';
  sheets = execFileSync(py, [path.join(ROOT, 'qa', 'sheet.py'), manifest, SHEETS], {encoding: 'utf8'}).trim().split('\n');
}

console.log(`${jobs.length} stills, runtime ${plan.runtime}s (${plan.total} frames)`);
for (const w of plan.warnings) console.log(`WARN ${w}`);
for (const s of sheets) console.log(path.relative(ROOT, s));
