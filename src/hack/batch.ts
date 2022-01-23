import {NS} from '../NetscriptDefinitions';
import {
  growFortifyAmount,
  growTime,
  hackFortifyAmount,
  hackTime,
  optimalHackPercent,
  threadsToGrow,
  weakenFortifyAmount,
  weakenTime
} from '../formulas';
import {Task} from './task-v2';
import {sleep} from '../util';

const HACK_TARGET = 0.8; // Hack 80% of the server's cash

interface Batch {
  hackTask: Task<'/synced/hack-hack.js'>;
  weakenHackTask: Task<'/synced/hack-weaken.js'>;
  growTask: Task<'/synced/hack-grow.js'>;
  weakenGrowTask: Task<'/synced/hack-weaken.js'>;
}

export function totalThreads(batch: Batch) {
  const {hackTask, weakenHackTask, growTask, weakenGrowTask} = batch;
  return hackTask.threads + weakenHackTask.threads + growTask.threads + weakenGrowTask.threads;
}

export async function runBatch(batch: Batch): Promise<void> {
  const {hackTask, weakenHackTask, growTask, weakenGrowTask} = batch;

  weakenHackTask.run();
  await sleep(Task.TimingFudgeDelay * 2);
  weakenGrowTask.run();
  await sleep(weakenGrowTask.expectedExecTime - growTask.expectedExecTime - Task.TimingFudgeDelay);
  growTask.run();
  await sleep(growTask.expectedExecTime - hackTask.expectedExecTime - Task.TimingFudgeDelay * 2);
  hackTask.run();

  await weakenGrowTask.exit();
}

export function createBatch(ns: NS, hostname: string): Batch {
  const server = ns.getServer(hostname); // reload the server to get the most accurate numbers

  /*

  ✨ M A T H S ✨

  - Say we hack 1% per thead = 0.01
  - Say we want to take 80% of the available cash, in other words, leave 20% remaining = 0.2
  WRONG:
  - (1 - 0.01) ^ threads = 0.2
  - Math.log(0.2) / Math.log(0.99) = threads = ~160

  RIGHT:
  - threads * perThread = hackPercent
  - threads = hackPercent / perThread = 0.8 / 0.01

  growPercent = amountToGrow / amountLeft = moneyTaken / (moneyAvailable - moneyTaken)
  growThreads = magic(growPercent)

  hackFortify = hackThreads * 0.002
  weaken(hack)Threads = hackFortify / 0.05
  growFortify = growThreads * 0.004
  weaken(grow)Threads = growFortify / 0.05
  */
  const hackPercentPerThread = optimalHackPercent(ns, server);
  const hackThreads = Math.ceil(HACK_TARGET / hackPercentPerThread); // overshoot the target a lil
  const moneyTaken = server.moneyMax * hackPercentPerThread * hackThreads;

  const growPercent = moneyTaken / (server.moneyMax - moneyTaken);
  const growThreads = threadsToGrow(ns, server, growPercent);

  const hackFortify = hackFortifyAmount * hackThreads; // 0.002 * threads
  const weakenHackThreads = Math.ceil(hackFortify / weakenFortifyAmount); // increase / 0.05
  const growFortify = growFortifyAmount * growThreads; // 0.004 * threads
  const weakenGrowThreads = Math.ceil(growFortify / weakenFortifyAmount); // increase / 0.05

  const weakenDuration = weakenTime(ns, server);
  const growDuration = growTime(ns, server);
  const hackDuration = hackTime(ns, server);

  const hackTask = new Task(ns, '/synced/hack-hack.js', {hostname: server.hostname}, hackDuration, hackThreads);
  const weakenHackTask = new Task(ns, '/synced/hack-weaken.js', {hostname: server.hostname}, weakenDuration, weakenHackThreads);
  const growTask = new Task(ns, '/synced/hack-grow.js', {hostname: server.hostname}, growDuration, growThreads);
  const weakenGrowTask = new Task(ns, '/synced/hack-weaken.js', {hostname: server.hostname}, weakenDuration, weakenGrowThreads);

  return {
    hackTask,
    weakenHackTask,
    growTask,
    weakenGrowTask
  };
}
