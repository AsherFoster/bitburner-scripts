import type {NS} from './NetscriptDefinitions';

type Network = Record<string, string[]>;

export function getNetwork(ns: NS, from: string, network: Network = {}): Network {
  const children = ns.scan(from);
  network[from] = children;
  children.forEach((server) => {
    if (!network[server]) {
      getNetwork(ns, server, network);
    }
  });

  return network;
}

export function getList(ns: NS, start: string): string[] {
  if (ns.isLogEnabled('scan')) ns.disableLog('scan');
  return Object.keys(getNetwork(ns, start));
}

export function shortestPath(network: Network, start: string, to: string): string[] {
  // god I hate pathfinding algorithms
  // bfs https://betterprogramming.pub/5-ways-to-find-the-shortest-path-in-a-graph-88cfefd0030f
  const previous = new Map();
  const visited = new Set();
  const queue: string[] = [start];
  visited.add(start);

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node === to) {
      const result = [];
      let thing = node;
      while (thing) {
        result.push(thing);
        thing = previous.get(thing);
      }
      return result.reverse();
    }

    network[node].forEach((neighbour) => {
      if (!visited.has(neighbour)) {
        previous.set(neighbour, node);
        queue.push(neighbour);
        visited.add(neighbour);
      }
    });
  }

  return ['No path found :('];
}
