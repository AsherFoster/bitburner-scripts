import type {NS} from '../NetscriptDefinitions';
import {getTasks, runTask} from '../hack/alloc-v2';

export async function main(ns: NS) {
  // start a loop, spawning tasks until we're out of memory
  const tasks = getTasks(ns);

  tasks.forEach(t => runTask(ns, t));
}