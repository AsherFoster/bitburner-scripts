import type {NS} from '../NetscriptDefinitions';
import {prepareServer, runBatch} from '../hack/batch';
import prioritiseServers from '../hack/prioritiseServers';

export async function main(ns: NS) {
  const priorities = prioritiseServers(ns);
  const target = priorities[0][0]; // throw everything at the optimal server for now

  await prepareServer(ns, target);

  const batchQueue: Promise<void>[] = [];

  while (true) { // TODO concurrent batches
    batchQueue.push(runBatch(ns, target));

    await batchQueue.shift();
  }
}
