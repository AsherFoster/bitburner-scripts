import type {NS} from '../NetscriptDefinitions';
import eventBus from '../eventBus';

export async function main(ns: NS): Promise<void> {
  ns.tprint(await eventBus.next('test'));
}
