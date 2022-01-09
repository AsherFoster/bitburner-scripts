import type {NS} from '../NetscriptDefinitions';
import {terraform} from '../root';

export async function main(ns: NS) {
  const hostname = ns.args[0] ? ns.args[0].toString() : ns.getHostname();
  await terraform(ns, hostname);

  ns.toast(`Terraformed ${hostname}`, 'success');
}
