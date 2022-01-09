import type {NS} from '../NetscriptDefinitions';
import {terraform} from '../root';
import {getList} from '../network';

async function clean(ns: NS, server: string, shouldTerraform: boolean): Promise<void> {
  ns.killall(server);

  const files = ns.ls(server, 'synced/');
  files.forEach(f => ns.rm(f, server));

  if (shouldTerraform) await terraform(ns, ns.getServer(server));
  // ns.tprint(`Cleaned${shouldTerraform ? ' and terraformed' : ''} server ${server}`);
}

export async function main(ns: NS) {
  const shouldTerraform = ns.args[0] === 'terraform';

  const toClean = getList(ns, ns.getHostname());

  toClean.splice(toClean.indexOf('home'), 1);

  for (const server of toClean) {
    await clean(ns, server, shouldTerraform);
  }

  ns.tprint(`Cleaned ${toClean.length} servers`);
}
