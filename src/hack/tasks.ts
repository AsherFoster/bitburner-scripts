import type {NS, Server} from '../NetscriptDefinitions';
import {getList} from '../network';

export interface TaskV1 {
  script: string;
  args: (string | number)[];
  threads: number;
}
export interface ScheduledTask {
  hostname: string;
  threads: number;
  task: TaskV1;
}

function executeScheduled(ns: NS, scheduled: ScheduledTask) {
  ns.exec(scheduled.task.script, scheduled.hostname, scheduled.threads, ...scheduled.task.args);
}

// Gets the memory left on the machine (will "hide" some memory on home)
function availableMemory(server: Server): number {
  // return Math.max((server.maxRam - server.ramUsed) - (server.hostname === 'home' ? 32 : 0), 0);
  return Math.max((server.maxRam - server.ramUsed) - 32, 0);
}

export function getServersWithAvailableMem(ns: NS): [Server, number][] {
  return getList(ns, 'home')
    .map(s => ns.getServer(s))
    .filter(s => s.hasAdminRights) // no point calculating ram if we can't use it
    .map(s => [s, availableMemory(s)]);
}

export function runTask(ns: NS, task: TaskV1) {
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
      throw new Error(`Unable to allocate all threads (${threadsToSchedule} remaining)`);
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