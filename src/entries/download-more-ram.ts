import type {NS} from '../NetscriptDefinitions';

const names = [
  'alpha',
  'bravo',
  'charlie',
  'delta',
  'echo',
  'foxtrot',
  'golf',
  'hotel',
  'india',
  'juliet',
  'kilo',
  'lima',
  'mike',
  'november',
  'oscar',
  'papa',
  'quebec',
  'romeo',
  'sierra',
  'tango',
  'uniform',
  'victor',
  'whiskey',
  'x-ray',
  'yankee',
  'zulu'
];

export async function main(ns :NS) {
  const selectedRam = ns.args[0];
  if (typeof selectedRam !== 'number') {
    const maxCost = ns.getServerMoneyAvailable('home') / ns.getPurchasedServerLimit();
    let bestRam = 0;
    for (let mem = 16; mem < 2 ** 20; mem *= 2) {
      if (ns.getPurchasedServerCost(mem) < maxCost) bestRam = mem;
      ns.tprint(`${mem.toString().padStart(6)} gb - ${ns.getPurchasedServerCost(mem).toLocaleString()}`);
    }

    ns.tprint(`Current best is ${bestRam} gb`);
  } else {
    ns.getPurchasedServers().forEach((s, i) => {
      const server = ns.getServer(s);
      if (server.maxRam < selectedRam) {
        ns.killall(server.hostname);
        ns.deleteServer(server.hostname);
        ns.purchaseServer('server-' + names[i], selectedRam);
      }
    });
  }
}