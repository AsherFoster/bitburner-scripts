function isValid(input: string): boolean {
  const stack: string[] = [];

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char == '(') stack.push(char);
    else if (char == ')' && !stack.pop()) return false;
  }

  return stack.length === 0;
}

function permute(input: string, changeCount: number): string[] {
  const fixedStrings: string[] = [];
  for (let i = 0; i < input.length; i++) {
    // recursively remove a letter until changeCount is 0
    const char = input[i];
    if (char === '(' || char === ')') {
      const newStr = input.substring(0, i) + input.substring(i + 1);
      if (changeCount > 0) {
        fixedStrings.push(...permute(newStr, changeCount - 1));
      } else if (isValid(newStr)) fixedStrings.push(newStr);
    }
  }
  return fixedStrings
    .filter((s, i) => fixedStrings.indexOf(s) === i); // dedupe before returning
}

function solveParentheses(input: string): string[] {
  for (let changeCount = 1; changeCount < 10; changeCount++) {
    const fixedStrings = permute(input, changeCount);
    if (fixedStrings.length) return fixedStrings;
  }
  throw new Error('Unable to find a valid string with < 10 changes');
}

export default {
  type: 'Sanitize Parentheses in Expression',
  description: /remove the minimum number of invalid parentheses in order to validate the string/,
  solve: solveParentheses
};
