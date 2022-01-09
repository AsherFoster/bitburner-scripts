import type {NS} from '../NetscriptDefinitions';
import type {MinerArgs} from './miner';

export const actualMinerScript = '/synced/miner.js';

// target, threads
export type MinerBootstrapArgs = [string, number];

export async function main(ns: NS) {
  const target = ns.getServer(ns.args[0] ? ns.args[0].toString() : undefined);

  const args: MinerArgs = [
    target.hostname,
    ns.getServerMaxMoney(target.hostname),
    ns.getServerMinSecurityLevel(target.hostname)
  ];

  ns.kill(actualMinerScript, target.hostname);

  let threadCount = ns.args[1];
  if (typeof threadCount !== 'number') {
    threadCount = Math.floor(target.maxRam / ns.getScriptRam(actualMinerScript));
  }

  // I think the spawn typedefs are wrong - it should support parsing numbers as args
  ns.spawn(actualMinerScript, threadCount, ...args as any[]);
}