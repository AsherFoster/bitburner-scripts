import type {NS} from '../NetscriptDefinitions';

export async function main(ns: NS) {
  const {hostname} = JSON.parse(ns.args[0] as string);

  const hacked = await ns.hack(hostname);

  console.log('hack finished', ns.args[0]);
  if (hacked) ns.toast(`Hacked ${hacked.toLocaleString()}`, 'success');
}