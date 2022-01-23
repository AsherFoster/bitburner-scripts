import type {NS} from '../NetscriptDefinitions';

export async function main(ns: NS) {
  const {hostname} = JSON.parse(ns.args[0] as string);

  await ns.grow(hostname);

  console.log('grow finished', ns.args[0]);
}