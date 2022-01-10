import type {NS} from '../NetscriptDefinitions';

// Defines the most a server can increase it's security
// before we weaken it
const maxSecurityIncrease = 2;

// Once the money available drops below this, grow it again
// to maximise profits
const minMoneyFactor = 0.8;

export type MinerArgs = [string, number, number];

export async function main(ns: NS) {
  const [target, serverMaxMoney, serverMinSecurity] = ns.args as MinerArgs;

  const minMoney = serverMaxMoney * minMoneyFactor;

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    if (ns.getServerSecurityLevel(target) - serverMinSecurity > maxSecurityIncrease) {
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
      if (earned) ns.toast(`Hacked $${earned.toLocaleString()} 💸`);
    }
  }
}
