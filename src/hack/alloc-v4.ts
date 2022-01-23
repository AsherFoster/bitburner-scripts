import type {NS, Server} from '../NetscriptDefinitions';
import {Task} from './task-v2';
import {createBatch, runBatch, totalThreads} from './batch';
import prioritiseServers from './prioritiseServers';
import {getServersWithAvailableMem} from './task-v1';
import {prepareServer} from './prepare';
import {sleep} from '../util';

const HACK_SCRIPT_COST = 1.75; // grow/weaken scripts are 1.75gb, hack is 1.7gb

function getThreadsFree(ns: NS): number {
  return getServersWithAvailableMem(ns)
    .reduce((prev, [, curr]) => prev + Math.floor(curr / HACK_SCRIPT_COST), 0);
}

// Got over-eager and figured that we'd be struggling to allocate all the RAM
// Turns out that you can fit a lot of 200ms tasks in ~60 seconds =
function guesstimateBatchThreadConsumption(ns: NS, hostname: string): number {
  const batch = createBatch(ns, hostname);
  const batchSize = totalThreads(batch);

  const batchDuration = batch.weakenHackTask.expectedExecTime + Task.TimingFudgeDelay * 2;

  const maxConcurrentBatches = Math.ceil(batchDuration / (Task.TimingFudgeDelay * 4)); // Overestimate consumption

  return batchSize * maxConcurrentBatches;
}

/**
 * Spawn the maximum number of batches targeting a server
 *
 * Each batch needs to have 4 tasks finish uninterrupted, so the max number of batches we can run is:
 * batchCount = cycleDuration / (fudgeDuration * 4)
 * */
async function spawnBatches(ns: NS, hostname: string, batchCap: number): Promise<never> {
  // Spawn as many batches until we hit min(batch limit, memory limit)
  // We could just keep blindly spawning batches every 4*fudgeDuration, this way we shouldn't inconsistently drift out of sync
  // If something goes wrong, we can just skip a batch and recover fine
  // TODO cap batches
  while (true) {
    const b = createBatch(ns, hostname);
    ns.tprint(`Running batch against ${hostname}, size ${totalThreads(b)}`);
    runBatch(b);

    await sleep(Task.TimingFudgeDelay);
  }
}

/**
 * For each server, spawn as many batches as possible, then move on to the next most profitable server
 *
 * TODO:
 * - Ok so we can spawn a batch per server, but there's more to do:
 * - DONE: Spawn more batches per server (up to the theoretical max)
 * - Actually deal with restarting a batch once it completes
 *
 * - DONE: And most importantly, fix that damn "not enough RAM" error
 * - DONE: Hack time estimates are based on the current security level, which might be problematic while weakening/preparing
 * - DONE: Because hack time estimates are based on the current level, we don't know what it'll be once the server is prepared
 *   - DONE: TODO work out where we should use hackTime vs minSecurityHackTime
 *
 * - I'm not 100% sure if a batch is ending where it started. Try running zero, to check prepare works, then run one, to check the batch works?
 * - DONE: Prepare works, but batches don't. Weaken appears to be finishing before hack - is this a fudge or math issue? Fudged more
 *
 * - Batches don't end where they started - I think this is due to allocation issues, ie 2x 1 thread != 1x 2 threads
 * */
export async function batchPlease(ns: NS): Promise<void> {
  const priorities = prioritiseServers(ns);
  let threadsFree = getThreadsFree(ns);

  const targets: [Server, number][] = [];
  for (const [server] of priorities) {
    ns.print(`🤔 ${threadsFree} threads available, preparing ${server.hostname}`);

    await prepareServer(ns, server);

    const batch = createBatch(ns, server.hostname);
    const batchSize = totalThreads(batch);

    const batchDuration = batch.weakenHackTask.expectedExecTime + Task.TimingFudgeDelay * 2;
    const maxConcurrentBatches = Math.ceil(batchDuration / (Task.TimingFudgeDelay * 4)); // Overestimate consumption

    const batchCap = Math.min(maxConcurrentBatches, Math.floor(threadsFree / batchSize));

    if (batchCap > 0) {
      threadsFree -= batchSize * batchCap;
      targets.push([server, batchCap]);

      ns.print(`💸 Server ${server.hostname}: Allocated ${batchCap} batches (${batchSize * batchCap} threads)`);
      ns.toast(`Server ${server.hostname} prepared, allocated ${batchCap} batches (${batchSize * batchCap} threads)`, 'info');
    } else break;
  }

  for (const [server, batchCap] of targets) {
    spawnBatches(ns, server.hostname, batchCap);

    ns.toast(`Running batches against ${server.hostname}`, 'info');
  }
}