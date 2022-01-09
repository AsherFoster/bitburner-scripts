import type {NS, Server} from '../NetscriptDefinitions';
import {canIHazRootPlz} from '../root';
import {getList} from '../network';

async function startup(ns: NS, server: Server) {
  ns.exec('synced/spawn.js', server.hostname, 1, 'synced/miner-bootstrap.js');
}

export async function main(ns: NS) {
  const current = ns.getServer();
  const servers = getList(ns, current.hostname)
    .map(s => ns.getServer(s))
    .filter(s => s.hostname !== 'home' && !s.purchasedByPlayer);

  for (const server of servers) {
    if (!server.hasAdminRights) {
      const rooted = canIHazRootPlz(ns, server);
      if (rooted) {
        ns.toast(`Pwned ${server.hostname}`, 'info');
        await startup(ns, server);
      } else {
        ns.tprint(`Not enough exploits to compromise server ${server.hostname}`, 'warning');
      }
    } else {
      await startup(ns, server);
    }
  }
}
