import type {NS, Server} from '../NetscriptDefinitions';

export async function main(ns: NS): Promise<void> {
  if (typeof ns.args[0] !== 'string') throw new Error('Server is required');
  const server = ns.getServer(ns.args[0]);

  ns.tprint(`\n== ${server.hostname} ==\n${(Object.keys(server) as (keyof Server)[]).map(k => `${k.padEnd(16)} - ${server[k]}`).join('\n')}`)
}
