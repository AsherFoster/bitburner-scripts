import {NS, Server} from './NetscriptDefinitions';

const growTimeMultiplier = 3.2; // Relative to hacking time. 16/5 = 3.2
const weakenTimeMultiplier = 4; // Relative to hacking time

export function hackTime(ns: NS, server: Server): number {
  return ns.getGrowTime(server.hostname) / growTimeMultiplier; // we don't have the getHackingTime function yet, but we can reverse it!
}
export function growTime(ns: NS, server: Server): number {
  return hackTime(ns, server) * growTimeMultiplier;
  // return ns.getGrowTime(server.hostname);
}
export function weakenTime(ns: NS, server: Server): number {
  return hackTime(ns, server) * weakenTimeMultiplier;
  // return ns.getWeakenTime(server.hostname);
}

const ServerBaseGrowthRate = 1.03; // Unadjusted Growth rate
const ServerMaxGrowthRate = 1.0035; // Maximum possible growth rate (max rate accounting for server security)

export const hackFortifyAmount = 0.002;
export const growFortifyAmount = hackFortifyAmount * 2;
export const weakenFortifyAmount = 0.05;

export function hackPercent(ns: NS, server: Server): number {
  return ns.hackAnalyze(server.hostname);
}
export function growPercent(ns: NS, server: Server, threads: number): number {
  const numServerGrowthCycles = Math.max(Math.floor(threads), 0);

  // Get adjusted growth rate, which accounts for server security
  let adjGrowthRate = 1 + (ServerBaseGrowthRate - 1) / server.hackDifficulty;
  if (adjGrowthRate > ServerMaxGrowthRate) {
    adjGrowthRate = ServerMaxGrowthRate;
  }

  // Calculate adjusted server growth rate based on parameters
  const serverGrowthPercentage = server.serverGrowth / 100;
  const numServerGrowthCyclesAdjusted = numServerGrowthCycles * serverGrowthPercentage; // * BitNodeMultipliers.ServerGrowthRate

  // Apply serverGrowth for the calculated number of growth cycles
  const coreBonus = 1 / 16;
  return Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted /* * p.hacking_grow_mult */ * coreBonus);
}

export function threadsToGrow(ns: NS, server: Server, percent: number): number {
  // percent coming in is the percent to add, ie cash = cash * (1 + percent)

  // Get adjusted growth rate, which accounts for server security
  let growthRate = 1 + (ServerBaseGrowthRate - 1) / server.hackDifficulty;
  if (growthRate > ServerMaxGrowthRate) {
    growthRate = ServerMaxGrowthRate;
  }

  // Calculate adjusted server growth rate based on parameters
  // TODO other factors may become relevant later
  // const threadFactor = (server.serverGrowth / 100) * BitNodeMultipliers.ServerGrowthRate * p.hacking_grow_mult * coreBonus;
  const threadFactor = server.serverGrowth / 100;

  // const x = Math.log(percent) / Math.log(growthRate) / threadFactor;
  // const y = growPercent(ns, server, x);
  // debugger;

  // growthRate ^ (threads * threadFactor) = percent
  return Math.ceil(Math.log(1 + percent) / Math.log(growthRate) / threadFactor);
}
