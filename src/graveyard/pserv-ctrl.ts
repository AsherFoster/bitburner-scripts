// pserv actions
// - scp a script
// - run a script
// - terminate a script

import {NS, Server} from '../NetscriptDefinitions';

function threadCount(ns: NS, script: string, hostname: string = ns.getHostname()): number {
  const threadUsage = ns.getScriptRam(script);
  const free = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname) - 0.5;
  return Math.floor(free / threadUsage);
}

async function doCommand(ns: NS, target: Server, command: string, args: string[]): Promise<void> {
  switch (command) {
    case 'scp':
      await ns.scp(args, ns.getHostname(), target.hostname);
      break;
    case 'run':
      const threads = threadCount(ns, args[0], target.hostname);
      ns.exec(args[0], target.hostname, threads, ...args.slice(1));
      break;
    default:
      throw new Error('Unknown command');
  }
}

export async function main(ns: NS) {
  const command = ns.args[0];
  if (typeof command !== 'string') {
    throw new Error('Command is required');
  }
  const args = ns.args.slice(1).map(a => a.toString());

  for (const pserv of ns.getPurchasedServers()) {
    await doCommand(ns, ns.getServer(pserv), command, args);
  }

  ns.toast(`Command ${command} run on ${ns.getPurchasedServers().length} servers`);
}
