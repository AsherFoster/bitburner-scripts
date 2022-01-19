import type {NS} from '../NetscriptDefinitions';
import {getList} from '../network';
import {actualMinerScript, MinerBootstrapArgs} from '../graveyard/miner-bootstrap';

interface TaskV0 {
  host: string;
  script: string;
  args: (string | number)[];
}

// When allocating the servers, we need to do three things:
// - Prioritise the servers somehow
function prioritiseServers(ns: NS): Record<string, number> {
  const skill = ns.getHackingLevel();
  const targetServers = getList(ns, 'home')
    .map(s => ns.getServer(s))
    .filter(s => !s.purchasedByPlayer && s.requiredHackingSkill <= skill);

  // priority = money / minStrength
  const priorities: Record<string, number> = {};
  targetServers.forEach(server => priorities[server.hostname] = server.moneyMax / server.minDifficulty);
  return priorities;
}

// - Create a pool of threads
//   (we can mark each server as having n number of threads, assuming miner.js is going to have a uniform RAM cost)
function getThreadPool(ns: NS): Record<string, number> {
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

// - Allocate the tasks amongst the thread pool according to their priority (do we hack one with everything, divvy them up?)
export function allocateTargets(ns: NS): TaskV0[] {
  const priorities = prioritiseServers(ns);
  const threadPool = getThreadPool(ns);

  // at the moment, let's just find the highest priority server and chuck everything at it
  const sortedPriorities = Object.entries(priorities).sort((a, b) => b[1] - a[1]);
  const target = sortedPriorities[0][0];

  return Object.keys(threadPool).map(host => ({
    host,
    script: 'synced/miner-bootstrap.js',
    args: [target, threadPool[host]] as MinerBootstrapArgs
  }));
}
