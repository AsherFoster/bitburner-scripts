import type {NS} from '../NetscriptDefinitions';
import {getList, getNetwork, shortestPath} from '../network';

export async function main(ns: NS) {
  const servers = getList(ns, ns.getHostname())
    .map(s => ns.getServer(s))
    .filter(s => !s.purchasedByPlayer);

  for (const server of servers) {
    if (server.hasAdminRights && !server.backdoorInstalled) {
      const path = shortestPath(getNetwork(ns, ns.getHostname()), ns.getHostname(), server.hostname).join(' -> ');
      const canBackdoor = server.requiredHackingSkill <= ns.getHackingLevel();
      ns.tprint(`(${canBackdoor ? 'READY' : 'LEVEL ' + server.requiredHackingSkill}) ${path}`);
    }
  }
}
