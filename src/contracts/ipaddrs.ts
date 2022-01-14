// ok so we need to place 3 dots in the string
// wxyz -> w.x.y.z

// start with the 3 valid places to put the first dot - 1234 -> 1.234, 12.34, 123.4

// wait 3 dots
// 3 options for first dot, 3 options for each of those, and 3 final options for each
// 3 ^ 3, that's only 27 options
// easy

type IP = [string, string, string, string];

function validate(ip: IP): boolean {
  return ip.every(chunk => parseInt(chunk) < 256 && !chunk.startsWith('0'));
}

export default {
  type: 'Generate IP Addresses',
  description: /return an array with all possible valid IP address combinations that can be created from the string/,
  solve(input: string): string[] {
    const ips: IP[] = [];
    for (let dotOne = 1; dotOne < 4 && dotOne < input.length; dotOne++) { // after the 1st char
      for (let dotTwo = dotOne + 1; dotTwo < dotOne + 4 && dotTwo < input.length; dotTwo++) {
        for (let dotThree = dotTwo + 1; dotThree < dotTwo + 4 && dotThree < input.length; dotThree++) {
          const ip: IP = [
            input.substring(0, dotOne),
            input.substring(dotOne, dotTwo),
            input.substring(dotTwo, dotThree),
            input.substring(dotThree)
          ];

          if (validate(ip)) ips.push(ip);
        }
      }
    }
    return ips.map(i => i.join('.'));
  }
};
