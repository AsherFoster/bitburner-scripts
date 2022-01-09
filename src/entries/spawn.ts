import type {NS} from '../NetscriptDefinitions';

// In exec-heavy scripts, exec this to avoid memory constraints
export async function main(ns: NS) {
  ns.spawn(ns.args[0].toString());
}
