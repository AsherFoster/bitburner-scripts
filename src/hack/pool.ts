import {NS} from '../NetscriptDefinitions';
import {getList} from '../network';
import {actualMinerScript} from '../graveyard/miner-bootstrap';

// - Create a pool of threads
//   (we can mark each server as having n number of threads, assuming miner.js is going to have a uniform RAM cost)
export function getThreadPool(ns: NS): Record<string, number> {
  const minerThreadCost = ns.getScriptRam(actualMinerScript);
  const hostServers = getList(ns, 'home').map(s => ns.getServer(s)).filter(s => s.hasAdminRights);

  const availThreadMap: Record<string, number> = {};

  hostServers.forEach((server) => {
    // We're going to make the bold assumption that this server is currently empty. Later on, we might want to handle
    // what happens if we're scheduling tasks on a server with stuff already running
    availThreadMap[server.hostname] = Math.floor(server.maxRam / minerThreadCost);
  });

  return availThreadMap;
}
