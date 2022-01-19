import {NS, Server} from './NetscriptDefinitions';

interface Exploit {
  name: string;
  use: (ns: NS, s: Server) => void;
  isUsed: (s: Server) => boolean;
}
const exploits: Exploit[] = [
  {
    name: 'HTTPWorm.exe',
    use: (ns, s) => ns.httpworm(s.hostname),
    isUsed: s => s.httpPortOpen
  },
  {
    name: 'BruteSSH.exe',
    use: (ns, s) => ns.brutessh(s.hostname),
    isUsed: s => s.sshPortOpen
  },
  {
    name: 'relaySMTP.exe',
    use: (ns, s) => ns.relaysmtp(s.hostname),
    isUsed: s => s.smtpPortOpen
  },
  {
    name: 'SQLInject.exe',
    use: (ns, s) => ns.sqlinject(s.hostname),
    isUsed: s => s.sqlPortOpen
  },
  {
    name: 'FTPCrack.exe',
    use: (ns, s) => ns.ftpcrack(s.hostname),
    isUsed: s => s.ftpPortOpen
  }
];

// So I'm not too sure what's going on, but server.openPortCount and server.*portOpen don't seem to update
// after opening a port. Instead, this is going to just blindly assume that these functions work
export function canIHazRootPlz(ns: NS, server: Server): boolean {
  // Get a list of exploits available to us
  const availableExploits = exploits.filter(e => ns.fileExists(e.name, 'home'));
  if (availableExploits.length < server.numOpenPortsRequired) {
    return false;
  }

  // We should have enough exploits to open this server up!
  availableExploits.forEach(e => e.isUsed(server) || e.use(ns, server));

  ns.nuke(server.hostname);

  return true;
}

export async function terraform(ns: NS, serverOrHostname: Server | string): Promise<void> {
  const hostname = typeof serverOrHostname === 'string' ? serverOrHostname : serverOrHostname.hostname;

  // remove old scripts
  const existingFiles = ns.ls(hostname, 'synced/');
  existingFiles.forEach(f => ns.rm(f, hostname));

  // copy over all our scripts
  const toCopy = ns.ls('home', 'synced/');
  await ns.scp(toCopy, 'home', hostname);
}