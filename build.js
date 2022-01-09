import * as fs from 'fs';
import * as path from 'path';
import {build} from 'esbuild';
// eslint-disable-next-line import/extensions
import {doPostRequestToBBGame} from './bb-api.js';

const entryDir = 'src/entries/';
const outDir = 'build';

/** Where the push script should upload scripts to, ingame */
const gameUploadDir = 'synced/';

/** Run `node build.js watch` to run ESBuild in watch mode */
const watch = process.argv.includes('watch');

/** Run `node build.js push` to push files into the game after building (Must have BB_AUTH_TOKEN set) */
const push = process.argv.includes('push');

/** Push a ESBuild result into the Bitburner game */
export function pushToGame(result) {
  if (!push) return;

  process.stdout.write(`⏳ Pushing ${result.outputFiles.length} files to game\r`);
  result.outputFiles.forEach((file) => {
    const relativePath = path.join(gameUploadDir, path.relative(outDir, file.path));
    doPostRequestToBBGame({
      action: 'UPSERT',
      filename: relativePath,
      code: file.text
    });
  });
  console.log(`💸 Pushed ${result.outputFiles.length} files to game`);
}

build({
  entryPoints: fs.readdirSync(entryDir).map(f => path.resolve(entryDir, f)),
  outdir: outDir,
  format: 'esm',
  bundle: true,
  write: !push,
  // splitting: true,
  target: 'firefox95',
  watch: watch && {
    onRebuild(error, result) {
      if (error) return console.error('***\n\nwatch build failed:', error);
      pushToGame(result);
    }
  }
}).then(result => pushToGame(result));
