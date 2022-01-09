import type {NS, Server} from './NetscriptDefinitions';

export function threadCount(ns: NS, script: string, server: Server): number {
  const threadUsage = ns.getScriptRam(script);
  const free = server.maxRam - server.ramUsed - 0.5;
  return Math.floor(free / threadUsage);
}

interface Exploit {
  name: string;
  use: (ns: NS, s: Server) => void;
  isUsed: (s: Server) => boolean;
}

export const exploits: Exploit[] = [
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
