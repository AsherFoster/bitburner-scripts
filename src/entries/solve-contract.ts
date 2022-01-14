import type {NS} from '../NetscriptDefinitions';
import {solve} from '../contracts';
import {getList} from '../network';

export async function main(ns: NS) {
  const dryRun = !!ns.args[0];
  getList(ns, 'home')
    .flatMap(h => ns.ls(h, '.cct').map(c => [h, c]))
    .forEach(([host, contract]) => solve(ns, contract, host, dryRun));
}
