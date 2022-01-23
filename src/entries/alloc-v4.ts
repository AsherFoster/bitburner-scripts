import type {NS} from '../NetscriptDefinitions';
import {batchPlease} from '../hack/alloc-v4';
import {pleaseDontLog} from '../util';

export async function main(ns: NS) {
  pleaseDontLog(ns, ['exec', 'scan', 'getHackingLevel']);
  await batchPlease(ns);
}
