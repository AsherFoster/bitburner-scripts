import type {NS} from '../NetscriptDefinitions';
import {getNetwork, shortestPath} from '../network';

export async function main(ns: NS) {
  const network = getNetwork(ns, 'home');

  if (ns.args[0]) {
    ns.tprint(shortestPath(network, ns.getHostname(), ns.args[0].toString()).join('\n -> '));
  } else {
    Object.keys(network).forEach(node => ns.tprint(`${node}  -- ${network[node].join(', ')}`));
  }
}
