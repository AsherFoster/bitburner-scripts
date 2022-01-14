import type {NS} from '../NetscriptDefinitions';
import {allocateTargets} from '../hack/alloc-v1';

export async function main(ns: NS) {
  const tasks = allocateTargets(ns);

  for (const task of tasks) {
    ns.exec(task.script, task.host, 1, ...task.args);
  }
}
