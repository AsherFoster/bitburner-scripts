import type {NS} from '../NetscriptDefinitions';

// Defines the most a server can increase its security
// before we weaken it
const maxSecurityIncrease = 5;

// Once the money available drops below this, grow it again
// to maximise profits
const minMoneyFactor = 0.75;

export async function main(ns: NS) {
  const target = ns.args[0].toString();
  if (!target) throw new Error('Target is required :(');

  const minMoney = ns.getServerMaxMoney(target) * minMoneyFactor;

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    if (ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target) > maxSecurityIncrease) {
      // If the server's security level is above our threshold, weaken it
      await ns.weaken(target);
      ns.print('Weakened');
    } else if (ns.getServerMoneyAvailable(target) < minMoney) {
      // If the server's money is less than our threshold, grow it
      await ns.grow(target);
      ns.print('Grew');
    } else {
      // Otherwise, hack it
      const earned = await ns.hack(target);
      ns.toast(`Hacked $${earned} 💸`);
    }
  }
}