import type {NS, Server} from '../NetscriptDefinitions';
import {getList} from '../network';

async function stealTheLiterature(ns: NS, server: Server): Promise<void> {
  const lits = ns.ls(server.hostname, '.lit');
  if (lits.length) {
    await ns.scp(lits, server.hostname, 'home');
    ns.tprint(`Stole some shit: ${lits.join(', ')}`);
  }
}

export async function main(ns: NS) {
  const toSearch = getList(ns, ns.getHostname())
    .map(s => ns.getServer(s))
    .filter(s => s.hostname !== 'home' && !s.purchasedByPlayer);

  for (const server of toSearch) {
    await stealTheLiterature(ns, server);
  }

  ns.tprint(`Schlooped books from ${toSearch.length} servers`);
}
