type Interval = [number, number];

function merge(a: Interval, b: Interval): Interval {
  return [
    Math.min(a[0], b[0]),
    Math.max(a[1], b[1])
  ];
}

function overlaps(a: Interval, b: Interval): boolean {
  return (a[0] >= b[0] && a[0] <= b[1]) // a starts in b
    || (a[1] >= b[0] && a[1] <= b[1]) // a ends in b
    || (b[0] >= a[0] && b[0] <= a[1]) // b starts in a
    || (b[1] >= a[0] && b[1] <= a[1]); // b ends in a
}

function mergeIntervals(outputIntervals: Interval[], interval: Interval): Interval[] {
  for (let i = 0; i < outputIntervals.length; i++) {
    const testInterval = outputIntervals[i];
    if (overlaps(interval, testInterval)) {
      outputIntervals[i] = merge(interval, testInterval);
      return outputIntervals;
    }
  }

  // Couldn't find anything to merge it with, just add it
  outputIntervals.push(interval);
  return outputIntervals;
}

export default {
  type: 'Merge Overlapping Intervals',
  description: /returned in ASCENDING order. You can assume that/,
  solve(input: Interval[]): Interval[] {
    return input
      .reduce(mergeIntervals, [] as Interval[])
      // there's the potential for two regions to be spanned by a third. In one pass, this will just add to one of them.
      // alternatively, be lazy and just do another pass. should work most of the time
      .reduce(mergeIntervals, [] as Interval[])
      .sort(([a], [b]) => a - b);
  }
};
