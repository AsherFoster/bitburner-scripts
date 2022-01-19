import type {NS} from '../NetscriptDefinitions';
import {runBatch} from '../hack/alloc-v4';

export async function main(ns: NS) {
  if (typeof ns.args[0] !== 'string') throw new Error('Server must be provided');

  await runBatch(ns, ns.getServer(ns.args[0]));
}