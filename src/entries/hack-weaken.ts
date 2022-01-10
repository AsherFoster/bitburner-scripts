import type {NS} from '../NetscriptDefinitions';

export async function main(ns: NS) {
  const target = ns.args[0];
  if (typeof target !== 'string') throw new Error('Target is required');

  await ns.weaken(target);
}