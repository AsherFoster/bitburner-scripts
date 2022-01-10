import type {NS, Server} from '../NetscriptDefinitions';
import {getList} from '../network';
import type {MinerArgs} from '../entries/miner';

interface Task {
  script: string;
  args: (string | number)[];
  threads: number;
}
interface ScheduledTask {
  hostname: string;
  threads: number;
  task: Task;
}

function executeScheduled(ns: NS, scheduled: ScheduledTask) {
  ns.exec(scheduled.task.script, scheduled.hostname, scheduled.threads, ...scheduled.task.args);
}

// Gets the memory left on the machine (will "hide" some memory on home)
function availableMemory(server: Server): number {
  return Math.max((server.maxRam - server.ramUsed) - (server.hostname === 'home' ? 16 : 0), 0);
}

function getServersWithAvailableMem(ns: NS): [Server, number][] {
  return getList(ns, 'home')
    .map(s => ns.getServer(s))
    .filter(s => s.hasAdminRights) // no point calculating ram if we can't use it
    .map(s => [s, availableMemory(s)]);
}

function maxThreadsForScript(ns: NS, script: string): number {
  const threadMemory = ns.getScriptRam(script);

  return getServersWithAvailableMem(ns)
    .map(([, available]) => Math.floor(available / threadMemory))
    .reduce((sum, next) => sum + next, 0);
}

export function runTask(ns: NS, task: Task) {
  const threadMemory = ns.getScriptRam(task.script);

  const eligibleHosts = getServersWithAvailableMem(ns)
    .filter(([, available]) => available > threadMemory) // filter to schedulable servers
    .sort(([, a], [, b]) => b - a); // sort by which have the most memory available

  let threadsToSchedule = task.threads;
  const scheduled: ScheduledTask[] = [];
  for (const [server, available] of eligibleHosts) {
    // ns.tprint(`${available} - ${threadMemory}`);
    const maxThreadsAvailable = Math.floor(available / threadMemory);
    const toSchedule = Math.min(threadsToSchedule, maxThreadsAvailable);
    if (toSchedule == 0) {
      // This server didn't have enough memory to run any threads - given we're going in descending order, no others will either
      throw new Error('Unable to allocate all threads');
    }

    scheduled.push({
      hostname: server.hostname,
      threads: toSchedule,
      task
    });
    threadsToSchedule -= toSchedule;

    if (threadsToSchedule == 0) break; // We've scheduled all required threads! Yay, we're done
  }

  scheduled.forEach(s => executeScheduled(ns, s)); // ensure we've allocated all threads before executing
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

export function getTasks(ns: NS): Task[] {
  const scriptToRun = '/synced/miner.js';
  const priorities = prioritiseServers(ns);
  // at the moment, let's just find the highest priority server and chuck everything at it
  const sortedPriorities = Object.entries(priorities).sort((a, b) => b[1] - a[1]);
  const target = sortedPriorities[0][0];

  return [{
    script: scriptToRun,
    args: [target, ns.getServerMaxMoney(target), ns.getServerMinSecurityLevel(target)] as MinerArgs,
    threads: maxThreadsForScript(ns, scriptToRun)
  }];
}
