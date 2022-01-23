import type {NS} from '../NetscriptDefinitions';
import {createBatch} from '../hack/batch';
import prioritiseServers from '../hack/prioritiseServers';
import {prepareServer} from '../hack/prepare';
import {Task} from '../hack/task-v2';
import {sleep} from '../util';

export async function main(ns: NS) {
  const priorities = prioritiseServers(ns);
  const target = priorities[0][0]; // throw everything at the optimal server for now

  await prepareServer(ns, target);

  while (true) {
    createBatch(ns, target.hostname);
    // runBatch runs for the lifetime of the batch, don't await TODO safety to ensure we don't spawn too many?

    await sleep(Task.TimingFudgeDelay *  4); // We can in theory spawn a task every 4n intervals
  }
}
