import type {NS} from '../NetscriptDefinitions';

export async function main(ns: NS) {
  const {hostname} = JSON.parse(ns.args[0] as string);

  await ns.weaken(hostname);
  console.log('weaken finished', ns.args[0]);
}
