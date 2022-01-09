import type {NS} from '../NetscriptDefinitions';

const purchaseRam = 8;
const serverNamePrefix = 'pserv-';

export async function main(ns: NS) {
  const pservLimit = ns.getPurchasedServerLimit();
  const pservs = ns.getPurchasedServers();

  while (pservs.length < pservLimit) {
    const cost = ns.getPurchasedServerCost(purchaseRam);
    ns.print(`A new server would cost ${cost}`);
    if (cost < ns.getServerMoneyAvailable('home')) {
      const newName = serverNamePrefix + pservs.length;
      ns.purchaseServer(newName, purchaseRam);
      pservs.push(newName);

      ns.toast(`Beep boop, purchased a new computer: ${newName}`, 'success');
    }
    await ns.sleep(2000);
  }
}