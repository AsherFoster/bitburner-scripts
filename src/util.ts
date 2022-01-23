import type {NS} from './NetscriptDefinitions';

export function sleep(duration: number): Promise<void> {
  return new Promise(r => setTimeout(() => r(), duration));
}

export function pleaseDontLog(ns: NS, funcs: string[]) {
  funcs.forEach(n => ns.isLogEnabled(n) && ns.disableLog(n));
}