import type {NS} from '../NetscriptDefinitions';
import prioritiseServers from '../hack/prioritiseServers';

export async function main(ns: NS): Promise<void> {
  const priorities = prioritiseServers(ns);
  priorities.slice(0, 20).forEach(([server, rank]) => {
    ns.tprint(`Server ${server.hostname.padEnd(20)} - $${rank.toLocaleString()} per second per thread`);
  });
}
