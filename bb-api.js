import * as http from 'http';

// TODO: Move to extension config? Does this _need_ to be configurable?
const BB_GAME_CONFIG = {
  port: 9990,
  schema: 'http',
  url: 'localhost',
  filePostURI: '/',
  validFileExtensions: ['.js', '.script', '.ns', '.txt']
};

const {BB_AUTH_TOKEN} = process.env;

/**
 * Make a POST request to the expected port of the game
 * @param {{ action: `CREATE` | `UPDATE` | `UPSERT` | `DELETE`, filename: string, code?: string }} payload The payload to send to the game client
 *
 * @see https://github.com/bitburner-official/bitburner-vscode/blob/master/src/extension.js#L260
 */
export function doPostRequestToBBGame(payload) {
  if (!BB_AUTH_TOKEN) throw new Error('BB_AUTH_TOKEN is required to communicate with the game API');

  // If the file is going to be in a director, it NEEDS the leading `/`, i.e. `/my-dir/file.js`
  // If the file is standalone, it CAN NOT HAVE a leading slash, i.e. `file.js`
  // The game will not accept the file and/or have undefined behaviour otherwise...
  const cleanPayload = {
    filename: `${payload.filename}`.replace(/[\\|/]+/g, '/'),
    code: Buffer.from(payload.code).toString('base64')
  };
  if (/\//.test(cleanPayload.filename)) {
    cleanPayload.filename = `/${cleanPayload.filename}`;
  }

  const stringPayload = JSON.stringify(cleanPayload);
  const options = {
    hostname: BB_GAME_CONFIG.url,
    port: BB_GAME_CONFIG.port,
    path: BB_GAME_CONFIG.filePostURI,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': stringPayload.length,
      Authorization: `Bearer ${BB_AUTH_TOKEN}`
    }
  };

  const req = http.request(options, (res) => {
    res.on('data', (d) => {
      const responseBody = Buffer.from(d).toString();

      if (res.statusCode === 200) return;
      throw new Error(`File ${cleanPayload.filename} failed to push, statusCode: ${res.statusCode} | message: ${responseBody}`);
    });
  });

  req.write(stringPayload);
  req.end();
}
