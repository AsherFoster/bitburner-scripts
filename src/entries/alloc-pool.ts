import type {NS} from '../NetscriptDefinitions';
import {getServersWithAvailableMem} from '../hack/task-v1';

export async function main(ns: NS): Promise<void> {
  const threads = getServersWithAvailableMem(ns)
    .map(([server, free]) => ([Math.floor((server.maxRam - free) / 1.75), Math.floor(server.maxRam / 1.75)] as [number, number]))


  const [used, cap] = threads
    .reduce(([totalUsed, totalCap], [u, c]) => [totalUsed + u, totalCap + c], [0, 0]);

  const serversUsed = threads.filter(([u]) => u > 0).length;

  const fractionUsed = used / cap;
  const barLen = 32;
  ns.tprint(`
[${'|'.repeat(Math.floor(barLen * fractionUsed))}${'-'.repeat(Math.ceil(barLen * (1 - fractionUsed)))}]
${used.toLocaleString()} threads of ${cap.toLocaleString()} threads used
${serversUsed} of ${threads.length} servers in use`);
}
