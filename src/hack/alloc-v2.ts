import type {NS} from '../NetscriptDefinitions';
import type {MinerArgs} from '../entries/miner';
import {getServersWithAvailableMem, TaskV1} from './tasks';
import prioritiseServers from './prioritiseServers';

function maxThreadsForScript(ns: NS, script: string): number {
  const threadMemory = ns.getScriptRam(script);

  return getServersWithAvailableMem(ns)
    .map(([, available]) => Math.floor(available / threadMemory))
    .reduce((sum, next) => sum + next, 0);
}

export function getTasks(ns: NS): TaskV1[] {
  const scriptToRun = '/synced/miner.js';
  const priorities = prioritiseServers(ns);
  // at the moment, let's just find the highest priority server and chuck everything at it
  const target = priorities[0][0];

  return [{
    script: scriptToRun,
    args: [target.hostname, ns.getServerMaxMoney(target.hostname), ns.getServerMinSecurityLevel(target.hostname)] as MinerArgs,
    threads: maxThreadsForScript(ns, scriptToRun)
  }];
}
