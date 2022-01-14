import type {NS} from '../NetscriptDefinitions';
import {getNetwork, shortestPath} from '../network';
import {runInTerminal} from '../dom';

export async function main(ns: NS) {
  const network = getNetwork(ns, ns.getHostname());

  if (ns.args[0]) {
    const cmd = '\nconnect ' + shortestPath(network, ns.getHostname(), ns.args[0].toString()).slice(1).join('; connect ');
    runInTerminal(cmd);
  } else {
    Object.keys(network).forEach((node) => {
      const server = ns.getServer(node);
      ns.tprint(`${server.hostname.padEnd(20)} @ ${server.organizationName.padEnd(20)} -> ${network[node].join(', ')}`)
    });
    ns.tprint(`${Object.keys(network).map(s => ns.getServer(s)).map(s => s.maxRam).reduce((sum, next) => sum + next, 0)} GB`);
  }
}
