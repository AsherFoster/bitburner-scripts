import type {NS} from '../NetscriptDefinitions';
import {canIHazRootPlz} from '../root';
import {getList} from '../network';

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
      } else {
        ns.tprint(`Not enough exploits to compromise server ${server.hostname}`, 'warning');
      }
    }
  }
}
