import type {NS, Server} from '../NetscriptDefinitions';
import {canIHazRootPlz, terraform} from '../root';

const compromisedServers = new Set();

async function startup(ns: NS, server: Server) {
  await terraform(ns, server);

  ns.exec('synced/worm.js', server.hostname);
}

export async function main(ns: NS) {
  const current = ns.getServer();
  if (current.hostname === 'home') compromisedServers.clear();
  compromisedServers.add(current.hostname);
  ns.tprint(`Worm running on ${current.hostname}`);

  // For each neighbour, hack it
  for (const hostname of ns.scan()) {
    // If we've already run this script on that server, don't run again
    if (compromisedServers.has(hostname)) continue;
    compromisedServers.add(current.hostname);

    const server = ns.getServer(hostname);
    if (!server.hasAdminRights) {
      const rooted = canIHazRootPlz(ns, server);
      if (rooted) {
        ns.toast(`Pwned ${server.hostname}`, 'info');
      } else {
        ns.tprint(`Not enough exploits to compromise server ${server.hostname}`, 'warning');
        continue;
      }
    }

    if (server.ramUsed === 0) {
      await startup(ns, server);
    }
  }

  // If all neighbours are hacked, run miner.js!
  // Spawn memory consumption is high, so instead run another script which mimics spawn
  if (current.hostname !== 'home' && !current.purchasedByPlayer) {
    ns.exec('synced/spawn.js', current.hostname, 1, 'synced/miner-bootstrap.js');
  }
}
