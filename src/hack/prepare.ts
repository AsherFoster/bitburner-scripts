import {NS, Server} from '../NetscriptDefinitions';
import {growFortifyAmount, growTime, threadsToGrow, weakenFortifyAmount, weakenTime} from '../formulas';
import {Task} from './task-v2';
import {sleep} from '../util';

export function isPrepared(server: Server): boolean {
  return server.hackDifficulty === server.minDifficulty && server.moneyAvailable === server.moneyAvailable;
}

export async function prepareServer(ns: NS, server: Server): Promise<void> {
  ns.print(`⏳ Preparing ${server.hostname} for hack`);

  if (isPrepared(server)) return ns.print(`✅ Server ${server.hostname} already prepared`);

  let amountToWeaken = server.hackDifficulty - server.minDifficulty;
  const amountToGrow = server.moneyMax - server.moneyAvailable;

  // Run a weaken task
  // If we're growing, schedule a grow task to finish just before the weaken
  const weakenDuration = weakenTime(ns, server);
  const growDuration = growTime(ns, server);

  let growTask: Task<'/synced/hack-grow.js'> | null = null;
  if (amountToGrow) {
    // $70 of $100 available
    // (100 - 70) / 70 = 30 / 70 = % to grow
    const threads = threadsToGrow(ns, server, amountToGrow / server.moneyAvailable);

    growTask = new Task(
      ns,
      '/synced/hack-grow.js',
      {hostname: server.hostname},
      growDuration,
      threads
    );

    amountToWeaken += growFortifyAmount * growTask.threads; // We need to offset the security from the grow too
  }

  if (amountToWeaken) {
    const weakenTask = new Task(ns, '/synced/hack-weaken.js', {hostname: server.hostname}, weakenDuration, Math.ceil(amountToWeaken / weakenFortifyAmount));

    weakenTask.run();

    if (growTask) {
      // we want this script to finish just before the weaken (which will take significantly longer)
      await sleep(weakenDuration - growDuration - Task.TimingFudgeDelay);
      growTask.run();
    }

    await weakenTask.exit();
  } else if (growTask) {
    growTask.run();
  }

  ns.print(`✅ Prepared ${server.hostname} for hack`);
}