import {NS, Server} from '../NetscriptDefinitions';
import {getList} from '../network';
import {optimalHackChance, optimalHackPercent, optimalHackTime} from '../formulas';

/**
 * Returns a sorted list of servers according to their average cash per second
 *
 * cps = hack chance * hack reward / hack duration
 * */
function prioritiseServers(ns: NS): [Server, number][] {
  const skill = ns.getHackingLevel();
  const targetServers = getList(ns, 'home')
    .map(s => ns.getServer(s))
    .filter(s => !s.purchasedByPlayer && s.requiredHackingSkill <= skill);


  const priorities = targetServers.map((server) => {
    // priority = avg dollars per second per thread
    // dps = hack chance * hack reward / hack duration
    return [
      server,
      optimalHackChance(ns, server) * server.moneyMax * optimalHackPercent(ns, server) /
      (optimalHackTime(ns, server) / 1000) // per second per thread
    ] as [Server, number];
  });

  priorities.sort(([,a], [,b]) => b - a);

  return priorities;
}

export default prioritiseServers;
