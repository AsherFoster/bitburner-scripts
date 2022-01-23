import type {NS} from '../NetscriptDefinitions';
import {getNetwork, shortestPath} from '../network';
import {runInTerminal} from '../dom';

export async function main(ns: NS) {
  const network = getNetwork(ns, ns.getHostname());
  const servers = Object.keys(network).map(s => ns.getServer(s));

  if (ns.args[0]) {
    const cmd = '\nconnect ' + shortestPath(network, ns.getHostname(), ns.args[0].toString()).slice(1).join('; connect ');
    runInTerminal(cmd);
  } else {
    ns.tprint(`
${servers.map(server => `${server.hostname.padEnd(20)} @ ${server.organizationName.padEnd(20)} -> ${network[server.hostname].join(', ')}`).join('\n')}

== STATS ==
${servers.map(s => s.maxRam).reduce((sum, next) => sum + next, 0)} GB
${servers.filter(s => s.hasAdminRights).map(s => s.maxRam).reduce((sum, next) => sum + next, 0)} GB on pwned servers`);
  }
}
