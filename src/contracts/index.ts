import type {NS} from '../NetscriptDefinitions';
import parentheses from './parentheses';
import {traderI, traderIII} from './trader';
import ipaddrs from './ipaddrs';
import prime from './prime';
import merge from './merge';

interface ContractSolver {
  type: string;
  description: RegExp;
  solve(input: any): string[] | number | number[][]
}

const solvers: ContractSolver[] = [
  parentheses,
  traderI,
  // traderII,
  traderIII,
  ipaddrs,
  // mathexpr,
  prime,
  merge
];

export function solve(ns: NS, name: string, host: string, dryRun = false) {
  const type = ns.codingcontract.getContractType(name, host);
  const description = ns.codingcontract.getDescription(name, host);
  const input = ns.codingcontract.getData(name, host);

  const solver = solvers.find(s => s.type === type);
  if (!solver) {
    ns.tprint(`Skipping contract ${name} @ ${host} - no solver for ${type}`);
    return;
  }

  if (!solver.description.test(description)) throw new Error(`Unexpected description for ${type} (${name} @ ${host})\n${description}`);

  debugger;
  const answer = solver.solve(input);
  ns.tprint(`\n${type}\n -> ${JSON.stringify(input)}\n == ${JSON.stringify(answer)}`);

  if (!dryRun) {
    const resp = ns.codingcontract.attempt(answer, name, host, { returnReward: true });
    ns.tprint(resp || 'Failed :(');
  }
}