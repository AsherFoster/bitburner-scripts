import type {NS} from '../NetscriptDefinitions';
import {getList} from '../network';
import {MinerBootstrapArgs} from '../graveyard/miner-bootstrap';
import {getThreadPool} from './pool';

export interface Task {
  host: string;
  script: string;
  args: (string | number)[];
}

// When allocating the servers, we need to do three things:
// - Prioritise the servers somehow
export function prioritiseServers(ns: NS): Record<string, number> {
  const skill = ns.getHackingLevel();
  const targetServers = getList(ns, 'home')
    .map(s => ns.getServer(s))
    .filter(s => !s.purchasedByPlayer && s.requiredHackingSkill <= skill);

  // priority = money / minStrength
  const priorities: Record<string, number> = {};
  targetServers.forEach(server => priorities[server.hostname] = server.moneyMax / server.minDifficulty);
  return priorities;
}

// - Allocate the tasks amongst the thread pool according to their priority (do we hack one with everything, divvy them up?)
export function allocateTargets(ns: NS): Task[] {
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
