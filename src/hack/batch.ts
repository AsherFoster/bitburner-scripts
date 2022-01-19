import {NS, Server} from '../NetscriptDefinitions';
import {
  growFortifyAmount,
  growTime, hackFortifyAmount,
  hackPercent,
  hackTime,
  threadsToGrow,
  weakenFortifyAmount,
  weakenTime
} from '../formulas';
import {Task} from './task-v2';

const HACK_TARGET = 0.8; // Hack 80% of the server's cash

export async function prepareServer(ns: NS, server: Server) {
  ns.print(`Preparing ${server.hostname} for hack`);

  let amountToWeaken = server.hackDifficulty - server.minDifficulty;
  const amountToGrow = server.moneyMax - server.moneyAvailable;

  // Run a weaken task
  // If we're growing, schedule a grow task to finish just before the weaken
  const weakenDuration = weakenTime(ns, server);
  const growDuration = growTime(ns, server);

  let growTask: Task | null = null;
  if (amountToGrow) {
    // $70 of $100 available
    // (100 - 70) / 70 = 30 / 70 = % to grow
    growTask = new Task(
      ns,
      'synced/hack-grow.js',
      [server.hostname],
      growDuration,
      threadsToGrow(ns, server, amountToGrow / server.moneyAvailable)
    );

    amountToWeaken += growFortifyAmount * growTask.threads; // We need to offset the security from the grow too
  }

  if (amountToWeaken) {
    const weakenTask = new Task(ns, 'synced/hack-weaken.js', [server.hostname], weakenDuration, Math.ceil(amountToWeaken / weakenFortifyAmount));

    weakenTask.run();

    if (growTask) {
      // we want this script to finish just before the weaken (which will take significantly longer)
      await ns.sleep(weakenDuration - growDuration - Task.TimingFudgeDelay);
      growTask.run();
    }

    await weakenTask.exit();
  } else if (growTask) {
    growTask.run();
  }
}

export async function runBatch(ns: NS, server: Server): Promise<void> {
  const weakenDuration = weakenTime(ns, server);
  const growDuration = growTime(ns, server);
  const hackDuration = hackTime(ns, server);

  /*

  ✨ M A T H S ✨

  - Say we hack 1% per thead = 0.01
  - Say we want to take 80% of the available cash, in other words, leave 20% remaining = 0.2
  WRONG:
  - (1 - 0.01) ^ threads = 0.2
  - Math.log(0.2) / Math.log(0.99) = threads = ~160

  RIGHT:
  - threads * perThread = hackPercent
  - threads = hackPercent / perThread = 0.2 / 0.01

  growPercent = amountToGrow / amountLeft = moneyTaken / (moneyAvailable - moneyTaken)
  growThreads = magic(growPercent)

  hackFortify = hackThreads * 0.002
  weaken(hack)Threads = hackFortify / 0.05
  growFortify = growThreads * 0.004
  weaken(grow)Threads = growFortify / 0.05
  */
  const hackPercentPerThread = hackPercent(ns, server);
  // const hackThreads = Math.ceil(Math.log(HACK_TARGET) / Math.log(1 - hackPercentPerThread));
  const hackThreads = Math.ceil(HACK_TARGET / hackPercentPerThread); // overshoot the target a lil
  const moneyTaken = server.moneyAvailable * hackPercentPerThread * hackThreads;

  const growPercent = moneyTaken / (server.moneyAvailable - moneyTaken);
  const growThreads = threadsToGrow(ns, server, growPercent);

  const hackFortify = hackFortifyAmount * hackThreads; // 0.002 * threads
  const weakenHackThreads = Math.ceil(hackFortify / weakenFortifyAmount); // increase / 0.05
  const growFortify = growFortifyAmount * growThreads; // 0.004 * threads
  const weakenGrowThreads = Math.ceil(growFortify / weakenFortifyAmount); // increase / 0.05

  const hackTask = new Task(ns, 'synced/hack-hack.js', [server.hostname], hackDuration, hackThreads);
  const weakenHackTask = new Task(ns, 'synced/hack-weaken.js', [server.hostname], weakenDuration, weakenHackThreads);
  const growTask = new Task(ns, 'synced/hack-grow.js', [server.hostname], growDuration, growThreads);
  const weakenGrowTask = new Task(ns, 'synced/hack-weaken.js', [server.hostname], weakenDuration, weakenGrowThreads);

  weakenHackTask.run();
  await ns.sleep(Task.TimingFudgeDelay * 2);
  weakenGrowTask.run();
  await ns.sleep(weakenDuration - growDuration - Task.TimingFudgeDelay);
  growTask.run();
  await ns.sleep(growDuration - hackDuration - Task.TimingFudgeDelay * 2);
  hackTask.run();

  await weakenGrowTask.exit();
}
