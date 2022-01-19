import type {NS} from '../NetscriptDefinitions';
import eventBus from '../eventBus';

export async function main(ns: NS): Promise<void> {
  eventBus.emit('test', 'hello!');
}
